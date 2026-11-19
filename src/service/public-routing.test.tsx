import React from "react";
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import LandingPage from "../landing/LandingPage";
import { publicPages, landingDestinations } from "../landing/destinations";

const expectedContent = {
  home: "Hospital engineering,",
  workflow: "From an equipment issue",
  service: "Service decisions,",
  equipment: "Equipment context",
  demo: "Explore the working demo.",
};

for (const { page, path } of publicPages) {
  test(`public ${path} has its own content, page heading and working navigation`, () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={[path]}><LandingPage page={page} /></MemoryRouter>,
    );
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    assert.equal((main.match(/<h1\b/g) ?? []).length, 1);
    let headingLevel = 0;
    for (const heading of main.matchAll(/<h([1-6])\b/g)) {
      const nextLevel = Number(heading[1]);
      assert.ok(nextLevel <= headingLevel + 1, "heading levels do not skip");
      headingLevel = nextLevel;
    }
    assert.ok(main.includes(expectedContent[page]));
    assert.equal(html.includes('href="#workflow"'), false);
    assert.equal(html.includes('href="#service"'), false);
    assert.equal(html.includes('href="#demo"'), false);
    for (const destination of publicPages) assert.ok(html.includes(`href="${destination.path}"`));
    assert.ok(html.includes(`aria-current="page" class="active" href="${path}"`));
    assert.ok(html.includes(`href="${landingDestinations.dashboard}"`));
    assert.equal(main.includes("DEMO-Q-CT-2026-01"), page === "service");
    assert.equal(main.includes("Step 1"), page === "workflow");
    assert.equal(main.includes("no connected telemetry"), page === "equipment");
  });
}

test("public route identities stay separate from operational workspace paths", () => {
  assert.equal(new Set(publicPages.map(({ path }) => path)).size, publicPages.length);
  for (const { path } of publicPages) {
    assert.equal(["/dashboard", "/assets", "/alerts", "/reviews", "/service"].includes(path), false);
  }
});
