import { test } from "node:test";
import assert from "node:assert/strict";
import {
  operationalFixture,
  testActionClock,
} from "../test/operationalFixture";
import { createGuideSession, guideProgress } from "./model";
import {
  deserializeGuide,
  readGuide,
  writeGuide,
  GUIDE_KEY,
} from "./persistence";
import { createReview } from "../reviews/model";
import { focusedTemplate } from "../reviews/focused";
import { demoSnapshot } from "../data/demo";
test("new guide sessions exclude old submitted reviews and completed follow-ups", () => {
  const { review, action } = operationalFixture();
  const session = createGuideSession([review], [action], testActionClock);
  const progress = guideProgress(session, [review], [action]);
  assert.equal(progress.completed, 0);
  assert.equal(progress.review, undefined);
  assert.equal(progress.action, undefined);
});
test("guide progress follows newly recorded IDs and independent re-verification without claiming equipment verification", () => {
  const old = operationalFixture(),
    fresh = operationalFixture();
  let session = createGuideSession([old.review], [old.action], testActionClock);
  session = {
    ...session,
    detectedAt: testActionClock.now(),
    assetViewedAt: testActionClock.now(),
    viewedReportIds: [fresh.review.id],
  };
  let progress = guideProgress(
    session,
    [fresh.review, old.review],
    [fresh.action, old.action],
  );
  assert.deepEqual(progress.done, [true, true, true, true, false]);
  const draft = createReview(
    focusedTemplate(demoSnapshot, "AHU-OT-01"),
    {
      technician: "Synthetic",
      role: "Demo",
      openingNotes: "",
      subjectAssetId: "AHU-OT-01",
      sourceFollowUpId: fresh.action.id,
    },
    { now: testActionClock.now, id: () => `REV-${testActionClock.id()}` },
  );
  progress = guideProgress(
    session,
    [draft, fresh.review, old.review],
    [fresh.action, old.action],
  );
  assert.equal(progress.completed, 5);
  assert.equal(progress.review?.id, fresh.review.id);
  assert.equal(progress.reVerification?.status, "Draft");
  assert.deepEqual(draft.responses, {});
});
test("Restart Guide resets only guide progress and never deletes reviews, actions or equipment history", () => {
  const { review, action, overlay } = operationalFixture();
  const before = JSON.stringify({ review, action, overlay });
  const first = createGuideSession([], [], testActionClock),
    restarted = createGuideSession([review], [action], testActionClock);
  assert.notEqual(first.id, restarted.id);
  assert.equal(guideProgress(restarted, [review], [action]).completed, 0);
  assert.equal(JSON.stringify({ review, action, overlay }), before);
  const data = new Map([
    ["medops.engineering-reviews.v1", JSON.stringify(review)],
    ["evidanor:followups:v1", JSON.stringify(action)],
    ["medops.demo.simulation.v1", JSON.stringify(overlay)],
  ]);
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
  assert.ok(writeGuide(storage, restarted));
  assert.ok(writeGuide(storage, null));
  assert.equal(data.size, 4);
  assert.equal(data.get("evidanor:followups:v1"), JSON.stringify(action));
  assert.ok(data.has(GUIDE_KEY));
});
test("guide persistence round-trips and handles malformed, incompatible and blocked storage", () => {
  const session = createGuideSession([], [], testActionClock);
  assert.deepEqual(
    deserializeGuide(JSON.stringify({ schemaVersion: 1, session }))?.session,
    session,
  );
  for (const raw of [
    "{",
    JSON.stringify({ schemaVersion: 2, session }),
    JSON.stringify({
      schemaVersion: 1,
      session: { ...session, baselineReviewIds: null },
    }),
  ])
    assert.equal(deserializeGuide(raw), null);
  assert.equal(readGuide(undefined).status, "unavailable");
  assert.equal(
    readGuide({ getItem: () => "{", setItem() {}, removeItem() {} }).status,
    "recovered",
  );
  assert.equal(
    writeGuide(
      {
        getItem: () => null,
        setItem() {
          throw Error("quota");
        },
        removeItem() {},
      },
      session,
    ),
    false,
  );
});
