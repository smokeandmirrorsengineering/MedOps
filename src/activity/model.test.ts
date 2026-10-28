import { test } from "node:test";
import assert from "node:assert/strict";
import { demoSnapshot } from "../data/demo";
import { operationalFixture } from "../test/operationalFixture";
import { equipmentActivity } from "./model";
test("equipment activity derives only stored sources with explicit simulated and actual clocks", () => {
  const { overlay, review, action } = operationalFixture();
  const before = JSON.stringify({ overlay, review, action });
  const activity = equipmentActivity(
    "AHU-OT-01",
    demoSnapshot.events,
    overlay.history,
    [review],
    [action],
  );
  assert.equal(
    activity.filter((event) => event.type === "Submitted engineering review")
      .length,
    1,
  );
  assert.equal(
    activity.filter((event) => event.type === "Follow-up action").length,
    3,
  );
  assert.equal(
    activity.filter((event) => event.type === "Simulation transition").length,
    1,
  );
  assert.equal(
    new Set(activity.map((event) => event.id)).size,
    activity.length,
  );
  assert.ok(
    activity
      .find((event) => event.id === `review:${review.id}`)
      ?.href.endsWith("/report"),
  );
  assert.ok(
    activity
      .filter((event) => event.id.startsWith("followup:"))
      .every((event) => event.clock === "Actual record time"),
  );
  assert.ok(
    activity
      .filter((event) => event.id.startsWith("simulation:"))
      .every((event) => event.clock === "Simulated equipment time"),
  );
  assert.equal(JSON.stringify({ overlay, review, action }), before);
});
test("activity excludes unrelated assets and drafts and never reconstructs hypothetical transitions", () => {
  const { overlay, review, action } = operationalFixture();
  const activity = equipmentActivity(
    "AHU-OT-01",
    [],
    overlay.history,
    [{ ...review, status: "Draft" }],
    [{ ...action, assetId: "UPS-02" }],
  );
  assert.equal(activity.length, 1);
  assert.equal(activity[0].id, `simulation:${overlay.history[0].id}`);
  assert.deepEqual(
    equipmentActivity(
      "NO-SUCH-ASSET",
      demoSnapshot.events,
      overlay.history,
      [review],
      [action],
    ),
    [],
  );
});
test("activity is ordered chronologically, uses source transition order for ties and deduplicates IDs", () => {
  const { overlay, review, action } = operationalFixture();
  const activity = equipmentActivity(
    "AHU-OT-01",
    demoSnapshot.events,
    [...overlay.history, ...overlay.history],
    [review],
    [action],
  );
  for (let index = 1; index < activity.length; index++)
    assert.ok(
      Date.parse(activity[index - 1].timestamp) >=
        Date.parse(activity[index].timestamp),
    );
  const actions = activity.filter((event) => event.type === "Follow-up action");
  assert.match(actions[0].description, /Action Completed/);
  assert.equal(actions.length, 3);
  assert.equal(
    activity.filter((event) => event.type === "Simulation transition").length,
    1,
  );
});
