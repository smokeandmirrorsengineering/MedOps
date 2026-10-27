import { test } from "node:test";
import assert from "node:assert/strict";
import { demoSnapshot } from "../data/demo";
import { buildDashboard } from "../domain/selectors";
import { categories } from "../domain/types";
import { categoryFromSlug, categoryMetadata } from "./categories";
import {
  clampPage,
  normalizeAssetParams,
  orderAssets,
  orderEvents,
  parseAssetParams,
  updateParams,
} from "./navigation";

test("every domain category maps to one unique URL-friendly system slug", () => {
  const slugs = categories.map((category) => categoryMetadata[category].slug);
  assert.deepEqual(slugs, ["hvac", "gas", "cold", "power", "lab"]);
  assert.equal(new Set(slugs).size, categories.length);
  categories.forEach((category) =>
    assert.equal(categoryFromSlug(categoryMetadata[category].slug), category),
  );
  assert.equal(categoryFromSlug("unknown"), "");
});
test("asset URLs parse search, system, condition and page together", () => {
  assert.deepEqual(
    parseAssetParams(
      new URLSearchParams("q=UPS+02&system=power&condition=Attention&page=3"),
    ),
    {
      query: "UPS 02",
      category: categories[3],
      condition: "Attention",
      requestedPage: 3,
    },
  );
});
test("invalid filters and malformed or excessive page numbers are safe", () => {
  for (const page of [
    "0",
    "-1",
    "abc",
    "2.5",
    "Infinity",
    "9007199254740992",
    "2e3",
    "",
  ]) {
    const result = parseAssetParams(
      new URLSearchParams({ system: "invalid", condition: "critical", page }),
    );
    assert.equal(result.category, "");
    assert.equal(result.condition, "");
    assert.equal(result.requestedPage, 1);
  }
  assert.equal(clampPage(999, 50, 8), 7);
  assert.equal(clampPage(999, 0, 8), 1);
  assert.equal(clampPage(3, 1, 8), 1);
});
test("normalization cleans invalid values, clamps pages, and preserves drawer/other parameters", () => {
  const params = new URLSearchParams(
    "system=invalid&condition=Critical&page=999&asset=MG-O2-01&source=demo",
  );
  const canonical = normalizeAssetParams(params, 1);
  assert.equal(
    canonical.toString(),
    "condition=Critical&asset=MG-O2-01&source=demo",
  );
  assert.equal(params.get("page"), "999");
});
test("filter changes reset pagination while drawer open/close preserves all filters", () => {
  const params = new URLSearchParams(
    "q=air&system=hvac&condition=Attention&page=2",
  );
  const filtered = updateParams(params, { q: "filter" }, true);
  assert.equal(filtered.has("page"), false);
  assert.equal(filtered.get("condition"), "Attention");
  const opened = updateParams(params, { asset: "AHU-OT-02" });
  assert.equal(opened.get("page"), "2");
  assert.equal(
    updateParams(opened, { asset: "" }).toString(),
    params.toString(),
  );
});
test("inventory sorts by engineering priority and then stable asset ID without mutation", () => {
  const { evaluated } = buildDashboard(demoSnapshot);
  const originalIds = evaluated.map((asset) => asset.id);
  const ordered = orderAssets(evaluated);
  assert.deepEqual(
    ordered.slice(0, 7).map((asset) => asset.id),
    [
      "MG-O2-01",
      "FRZ-LAB-03",
      "AHU-OT-02",
      "CHL-01",
      "FRG-BB-02",
      "LAB-CEN-02",
      "UPS-02",
    ],
  );
  assert.equal(
    ordered.slice(7).every((asset) => asset.condition === "Normal"),
    true,
  );
  assert.deepEqual(
    evaluated.map((asset) => asset.id),
    originalIds,
  );
});
test("events sort by severity before timestamp without mutating provider evidence", () => {
  const active = demoSnapshot.events.filter((event) => event.active);
  const original = active.map((event) => event.id);
  const ordered = orderEvents([...active].reverse());
  assert.equal(ordered.length, 7);
  assert.equal(ordered[0].severity, "Critical");
  assert.equal(ordered.at(-1)?.assetId, "FRZ-LAB-03");
  assert.ok(
    ordered.slice(1, 6).every((event) => event.severity === "Attention"),
  );
  assert.deepEqual(
    active.map((event) => event.id),
    original,
  );
});
