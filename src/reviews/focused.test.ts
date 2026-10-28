import { test } from "node:test";
import assert from "node:assert/strict";
import { demoSnapshot } from "../data/demo";
import { focusedTemplate, FOCUSED_TEMPLATE_ID, focusedItems } from "./focused";
import { otTemplate } from "./template";
import { createReview, saveResponse, submitReview } from "./model";
import { captureEvidence } from "./evidence";
import { blankVerification, type ReviewSession } from "./types";
import { deserializeReviews } from "./persistence";
import { buildReviewSummary } from "./report";
import {
  initialOverlay,
  createSimulationReducer,
  effectiveSnapshot,
} from "../simulation/model";
let sequence = 0;
const clock = {
  now: () => "2026-10-29T02:00:00.000Z",
  id: () => `REV-FOCUSED-${++sequence}`,
};
const identity = {
  technician: "Synthetic reviewer",
  role: "Demo engineer",
  openingNotes: "Synthetic only",
};
const fault = effectiveSnapshot(
  demoSnapshot,
  createSimulationReducer(demoSnapshot)(initialOverlay(demoSnapshot), {
    type: "ACTIVATE_FAULT",
  }),
);
function create(assetId = "AHU-OT-01", snapshot = demoSnapshot) {
  return createReview(
    focusedTemplate(snapshot, assetId),
    { ...identity, subjectAssetId: assetId },
    clock,
  );
}
const input = () => ({
  ...blankVerification(),
  choice: "Pass" as const,
  method: "Other" as const,
  observation:
    "Synthetic UI evidence review; independent physical verification is not claimed.",
  reconciliation:
    "Synthetic human assessment conflicts with the recorded abnormal evidence; the discrepancy remains unresolved.",
  responsible: "Demo engineering lead",
  followUp:
    "Investigate the recorded indication and arrange independent verification.",
  gaps: [],
  acknowledgedIssues: [] as string[],
});
function complete(review: ReviewSession, snapshot = demoSnapshot) {
  const current = Object.fromEntries(
    review.template.items.map((item) => [
      item.id,
      captureEvidence(item, review.template, snapshot, [], clock.now()),
    ]),
  );
  for (const item of review.template.items) {
    const value = {
      ...input(),
      acknowledgedIssues: current[item.id].issues.map((issue) => issue.key),
    };
    const result = saveResponse(
      review,
      item.id,
      value,
      current[item.id],
      clock,
    );
    assert.deepEqual(result.errors, []);
    review = result.review;
  }
  const result = submitReview(review, current, clock);
  assert.deepEqual(result.errors, []);
  return result.review;
}
test("focused template has exactly three stable items bound only to an existing selected asset", () => {
  for (const asset of demoSnapshot.assets) {
    const template = focusedTemplate(demoSnapshot, asset.id);
    assert.equal(template.id, FOCUSED_TEMPLATE_ID);
    assert.equal(template.items.length, 3);
    assert.deepEqual(
      template.items.map((item) => item.id),
      focusedItems.map((item) => item.id),
    );
    assert.deepEqual(template.scopeAssetIds, [asset.id]);
    for (const item of template.items) {
      assert.deepEqual(item.assetIds, [asset.id]);
      assert.equal(item.rules.reconcilePassConflict, true);
    }
  }
  assert.throws(() => focusedTemplate(demoSnapshot, "NOT-AN-ASSET"));
});
test("focused draft requires subject binding, has no automatic Pass and keeps independent session IDs", () => {
  const first = create(),
    second = create(),
    other = create("FRG-BB-01");
  assert.deepEqual(first.responses, {});
  assert.notEqual(first.id, second.id);
  assert.notEqual(other.id, first.id);
  assert.throws(() =>
    createReview(
      focusedTemplate(demoSnapshot, "AHU-OT-01"),
      { ...identity, subjectAssetId: "UPS-02" },
      clock,
    ),
  );
  const row = first.template.items[0],
    evidence = captureEvidence(
      row,
      first.template,
      demoSnapshot,
      [],
      clock.now(),
    );
  assert.ok(
    saveResponse(
      first,
      row.id,
      { ...input(), choice: "", method: "" },
      evidence,
      clock,
    ).errors.length,
  );
});
test("every focused item reuses Critical/Pass reconciliation, exception ownership and immutable submission rules", () => {
  const review = create("AHU-OT-01", fault),
    row = review.template.items[0],
    evidence = captureEvidence(row, review.template, fault, [], clock.now());
  assert.ok(
    saveResponse(
      review,
      row.id,
      { ...input(), reconciliation: "" },
      evidence,
      clock,
    ).errors.some((error) => error.includes("reconciliation")),
  );
  assert.ok(
    saveResponse(
      review,
      row.id,
      { ...input(), responsible: "N/A" },
      evidence,
      clock,
    ).errors.length,
  );
  const submitted = complete(review, fault);
  assert.equal(submitted.exceptions.length, 3);
  assert.equal(buildReviewSummary(submitted).reviewedCount, 3);
  assert.equal(buildReviewSummary(submitted).exceptionCount, 3);
  assert.ok(
    saveResponse(submitted, row.id, input(), evidence, clock).errors.includes(
      "Submitted reviews are immutable.",
    ),
  );
});
test("focused evidence and frozen wording remain historical after current fault clearance", () => {
  const review = create("AHU-OT-01", fault),
    submitted = complete(review, fault),
    before = JSON.stringify(submitted);
  const current = captureEvidence(
    submitted.template.items[0],
    submitted.template,
    demoSnapshot,
    [],
    clock.now(),
  );
  assert.equal(current.assets[0].condition, "Normal");
  assert.equal(
    submitted.responses[focusedItems[0].id].evidence.assets[0].condition,
    "Critical",
  );
  review.template.items[0].title = "Later changed title";
  assert.notEqual(
    submitted.template.items[0].title,
    review.template.items[0].title,
  );
  assert.equal(JSON.stringify(submitted), before);
});
test("mixed OT/focused drafts and submissions restore without migration or OT record changes", () => {
  const old = complete(createReview(otTemplate, identity, clock));
  const oldJson = JSON.stringify(old);
  const sessions = [old, create(), create(), complete(create("FRG-BB-01"))];
  const result = deserializeReviews(
    JSON.stringify({ schemaVersion: 1, sessions }),
  );
  assert.deepEqual(result?.sessions, sessions);
  assert.equal(JSON.stringify(result?.sessions[0]), oldJson);
  assert.equal(result?.sessions[0].subjectAssetId, undefined);
});
test("focused persistence rejects mismatched subjects, foreign evidence and altered binding", () => {
  const review = complete(create("FRG-BB-01"));
  for (const change of [
    (r: ReviewSession) => {
      r.subjectAssetId = "UPS-02";
    },
    (r: ReviewSession) => {
      r.template.items[0].assetIds = ["UPS-02"];
    },
    (r: ReviewSession) => {
      r.responses[focusedItems[0].id].evidence.assets[0].id = "UPS-02";
    },
  ]) {
    const copy = structuredClone(review);
    change(copy);
    assert.equal(
      deserializeReviews(
        JSON.stringify({ schemaVersion: 1, sessions: [copy] }),
      ),
      null,
    );
  }
});
test("Unknown-focused evidence retains quality semantics and re-verification is a new independent record", () => {
  const unknown = create("FRZ-LAB-03"),
    row = unknown.template.items[0],
    evidence = captureEvidence(
      row,
      unknown.template,
      demoSnapshot,
      [],
      clock.now(),
    );
  assert.equal(evidence.assets[0].condition, "Unknown");
  assert.ok(
    evidence.assets[0].readings.some(
      (reading) => reading.quality === "Unavailable",
    ),
  );
  assert.ok(
    saveResponse(
      unknown,
      row.id,
      { ...input(), reconciliation: "" },
      evidence,
      clock,
    ).errors.length,
  );
  const original = complete(create("AHU-OT-01", fault), fault),
    before = JSON.stringify(original);
  const reverify = createReview(
    focusedTemplate(demoSnapshot, "AHU-OT-01"),
    {
      ...identity,
      subjectAssetId: "AHU-OT-01",
      sourceFollowUpId: "FU-SOURCE-1",
    },
    clock,
  );
  assert.notEqual(reverify.id, original.id);
  assert.equal(reverify.status, "Draft");
  assert.deepEqual(reverify.responses, {});
  assert.equal(JSON.stringify(original), before);
  assert.ok(
    deserializeReviews(
      JSON.stringify({ schemaVersion: 1, sessions: [original, reverify] }),
    ),
  );
});
