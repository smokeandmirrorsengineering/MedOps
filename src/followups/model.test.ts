import { test } from "node:test";
import assert from "node:assert/strict";
import { demoSnapshot } from "../data/demo";
import { createReview, saveResponse, submitReview } from "../reviews/model";
import { captureEvidence } from "../reviews/evidence";
import { otTemplate } from "../reviews/template";
import { blankVerification } from "../reviews/types";
import {
  initialOverlay,
  createSimulationReducer,
  effectiveSnapshot,
} from "../simulation/model";
import { saveSimulation } from "../simulation/persistence";
import { REVIEW_STORAGE_KEY } from "../reviews/persistence";
import { createFollowUp, updateFollowUp, validTransition } from "./model";
import {
  emptyFollowUps,
  deserializeFollowUps,
  FOLLOW_UP_KEY,
  readFollowUps,
  writeFollowUps,
} from "./persistence";
import type { FollowUp, ActionClock } from "./types";
let id = 0;
const clock: ActionClock = {
  now: () => "2026-10-29T01:00:00.000Z",
  id: () => `TEST-${++id}`,
};
function fixture() {
  const snapshot = effectiveSnapshot(
    demoSnapshot,
    createSimulationReducer(demoSnapshot)(initialOverlay(demoSnapshot), {
      type: "ACTIVATE_FAULT",
    }),
  );
  const reviewClock = { now: clock.now, id: () => `REV-${clock.id()}` };
  let review = createReview(
    otTemplate,
    {
      technician: "Synthetic engineer",
      role: "Facilities",
      openingNotes: "Synthetic test",
    },
    reviewClock,
  );
  const current = Object.fromEntries(
    otTemplate.items.map((item) => [
      item.id,
      captureEvidence(item, otTemplate, snapshot, [], clock.now()),
    ]),
  );
  for (const item of otTemplate.items) {
    const result = saveResponse(
      review,
      item.id,
      {
        ...blankVerification(),
        choice: "Pass",
        method: "Other",
        observation: "Synthetic evidence review only.",
        reconciliation:
          "Synthetic human assessment differs; Critical evidence remains unresolved.",
        responsible: "Demo engineering lead",
        followUp: "Investigate the captured indication.",
        gaps: [],
        acknowledgedIssues: current[item.id].issues.map((issue) => issue.key),
      },
      current[item.id],
      reviewClock,
    );
    assert.deepEqual(result.errors, []);
    review = result.review;
  }
  review = submitReview(review, current, reviewClock).review;
  return {
    review,
    snapshot,
    exception: review.exceptions.find(
      (exception) => exception.assetId === "AHU-OT-01",
    )!,
  };
}
function created() {
  const f = fixture();
  const result = createFollowUp(
    emptyFollowUps(),
    f.review,
    f.exception.id,
    {
      responsible: "Demo OT engineer",
      proposedAction: "Inspect the synthetic filter indication.",
    },
    clock,
  );
  assert.deepEqual(result.errors, []);
  return { ...f, ...result, record: result.record! };
}
const edit = (
  record: FollowUp,
  status = record.status,
  note = "Synthetic progress note",
) => ({
  responsible: record.responsible,
  proposedAction: record.proposedAction,
  status,
  note,
});
test("follow-up creation retains source identity and enforces one primary action per submitted exception", () => {
  const { review, exception, store, record } = created();
  assert.equal(record.status, "Open");
  assert.equal(record.assetId, "AHU-OT-01");
  assert.equal(record.sourceExceptionId, exception.id);
  const again = createFollowUp(
    store,
    review,
    exception.id,
    { responsible: "", proposedAction: "" },
    clock,
  );
  assert.equal(again.record?.id, record.id);
  assert.equal(again.store.records.length, 1);
  assert.equal(again.store, store);
  assert.ok(
    createFollowUp(
      emptyFollowUps(),
      { ...review, status: "Draft" },
      exception.id,
      { responsible: "Engineer", proposedAction: "Inspect" },
      clock,
    ).errors.length,
  );
});
test("follow-up assignment rejects missing and placeholder ownership/action", () => {
  const { review, exception } = fixture();
  assert.ok(
    createFollowUp(
      emptyFollowUps(),
      review,
      exception.id,
      { responsible: "N/A", proposedAction: "None" },
      clock,
    ).errors.length,
  );
});
test("status history is append-only and only forward transitions are allowed", () => {
  const { record } = created(),
    before = JSON.stringify(record);
  assert.equal(validTransition("Open", "Action Completed"), false);
  assert.ok(
    updateFollowUp(record, edit(record, "Action Completed", "Completed"), clock)
      .errors.length,
  );
  const progress = updateFollowUp(record, edit(record, "In Progress"), clock);
  assert.deepEqual(progress.errors, []);
  assert.equal(progress.record.history.length, 2);
  assert.deepEqual(progress.record.history[0], record.history[0]);
  assert.equal(JSON.stringify(record), before);
  assert.ok(
    updateFollowUp(progress.record, edit(progress.record, "Open"), clock).errors
      .length,
  );
});
test("Action Completed requires a meaningful completion note and is read-only afterward", () => {
  let { record } = created();
  record = updateFollowUp(record, edit(record, "In Progress"), clock).record;
  assert.ok(
    updateFollowUp(
      record,
      edit(record, "Action Completed", "N/A"),
      clock,
    ).errors.some((error) => error.includes("completion note")),
  );
  const completed = updateFollowUp(
    record,
    edit(
      record,
      "Action Completed",
      "Synthetic action documented; equipment has not been re-verified.",
    ),
    clock,
  );
  assert.deepEqual(completed.errors, []);
  assert.equal(completed.record.history.length, 3);
  assert.equal(completed.record.progressNotes.length, 2);
  assert.ok(
    updateFollowUp(completed.record, edit(completed.record), clock).errors
      .length,
  );
});
test("recording action completion cannot change equipment, exceptions or the submitted review", () => {
  const f = created(),
    frozenReview = JSON.stringify(f.review),
    equipment = JSON.stringify(f.snapshot);
  let record = updateFollowUp(
    f.record,
    edit(f.record, "In Progress"),
    clock,
  ).record;
  record = updateFollowUp(
    record,
    edit(
      record,
      "Action Completed",
      "Synthetic action recorded. New independent verification is needed.",
    ),
    clock,
  ).record;
  assert.equal(record.status, "Action Completed");
  assert.equal(JSON.stringify(f.review), frozenReview);
  assert.equal(JSON.stringify(f.snapshot), equipment);
  assert.equal(f.review.exceptions[0].status, "Open");
});
test("follow-up storage round-trips separate records and rejects malformed versions/history/duplicates", () => {
  const { store, record } = created();
  assert.deepEqual(deserializeFollowUps(JSON.stringify(store)), store);
  for (const raw of [
    "{",
    JSON.stringify({ ...store, schemaVersion: 2 }),
    JSON.stringify({ ...store, records: [record, record] }),
    JSON.stringify({
      ...store,
      records: [
        {
          ...record,
          history: [{ ...record.history[0], to: "Action Completed" }],
        },
      ],
    }),
    JSON.stringify({ ...store, records: [{ ...record, responsible: "N/A" }] }),
  ])
    assert.equal(deserializeFollowUps(raw), null);
  assert.equal(
    readFollowUps({ getItem: () => "{", setItem() {}, removeItem() {} }).status,
    "recovered",
  );
});
test("unavailable/quota-limited follow-up storage fails explicitly without crashing", () => {
  const store = created().store;
  assert.equal(readFollowUps(undefined).status, "unavailable");
  assert.equal(writeFollowUps(undefined, store), false);
  const blocked = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("quota");
    },
    removeItem() {},
  };
  assert.equal(readFollowUps(blocked).status, "unavailable");
  assert.equal(writeFollowUps(blocked, store), false);
});
test("equipment Reset persistence leaves follow-ups and submitted review data intact", () => {
  const { store, review } = created();
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
  writeFollowUps(storage, store);
  storage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(review));
  saveSimulation(storage, initialOverlay(demoSnapshot));
  assert.ok(data.has(FOLLOW_UP_KEY));
  assert.equal(storage.getItem(REVIEW_STORAGE_KEY), JSON.stringify(review));
});
