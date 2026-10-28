import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { demoSnapshot } from "../data/demo";
import { captureEvidence } from "./evidence";
import {
  createReview,
  deriveExceptions,
  saveResponse,
  submitReview,
} from "./model";
import { otTemplate } from "./template";
import {
  AUTHORIZATION_STATEMENT,
  blankVerification,
  type ReviewSession,
} from "./types";
import { buildReviewSummary } from "./report";
import { ReviewSummary } from "./ReviewSummary";
import { ReportEvidence } from "./ReportEvidence";
import { deserializeReviews } from "./persistence";
import { followUpLabel, hasFollowUpText, responsibleLabel } from "./followUp";

const clock = {
  now: () => "2026-10-28T12:34:00.000Z",
  id: () => "REV-REPORT-TEST",
};
function sample() {
  let review = createReview(
    otTemplate,
    {
      technician: "Synthetic technician",
      role: "Facilities engineer",
      openingNotes: "",
    },
    clock,
  );
  const current = Object.fromEntries(
    otTemplate.items.map((item) => [
      item.id,
      captureEvidence(item, otTemplate, demoSnapshot, [], clock.now()),
    ]),
  );
  for (const item of otTemplate.items) {
    const result = saveResponse(
      review,
      item.id,
      {
        ...blankVerification(),
        choice: "Pass",
        method: "Visual inspection",
        observation: "Synthetic inspection recorded.",
        responsible: "OT engineering lead",
        followUp: "Inspect the recorded indication and document follow-up.",
        gaps: [],
        acknowledgedIssues: current[item.id].issues.map((issue) => issue.key),
      },
      current[item.id],
      clock,
    );
    assert.deepEqual(result.errors, []);
    review = result.review;
  }
  review = { ...review, summary: "Full pass." };
  const submitted = submitReview(review, current, clock);
  assert.deepEqual(submitted.errors, []);
  return { review: submitted.review, current };
}
function legacy() {
  const { review } = sample();
  for (const response of Object.values(review.responses)) {
    response.responsible = "N/A";
    response.followUp = "N/A";
  }
  review.exceptions = deriveExceptions(review);
  return review;
}
function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    Object.values(value).forEach(freeze);
  }
  return value;
}

test("summary projects frozen nine-Pass/three-exception history without mutation or telemetry recalculation", () => {
  const review = freeze(sample().review),
    before = JSON.stringify(review);
  const summary = buildReviewSummary(review);
  assert.equal(summary.reviewedCount, 9);
  assert.equal(summary.exceptionCount, 3);
  assert.equal(summary.allHumanPass, true);
  assert.deepEqual(
    summary.items.map((item) => item.response),
    Array(9).fill("Pass"),
  );
  assert.deepEqual(
    summary.findings.map((finding) => finding.asset),
    ["AHU-OT-02", "AHU-OT-02", "UPS-02"],
  );
  assert.equal(summary.items[0].findings.length, 1);
  assert.equal(summary.items[1].findings.length, 1);
  assert.equal(summary.items[4].findings.length, 1);
  assert.equal(summary.observations, "Full pass.");
  assert.equal(JSON.stringify(review), before);
  assert.throws(() => buildReviewSummary({ ...review, status: "Draft" }));
});

test("legacy missing follow-up is labeled without changing or rejecting submitted history", () => {
  const review = freeze(legacy()),
    before = JSON.stringify(review);
  const summary = buildReviewSummary(review);
  assert.equal(summary.missingFollowUpCount, 3);
  for (const finding of summary.findings) {
    assert.equal(finding.responsible, "Unassigned");
    assert.equal(finding.followUp, "Not specified");
  }
  const restored = deserializeReviews(
    JSON.stringify({ schemaVersion: 1, sessions: [review] }),
  );
  assert.deepEqual(restored?.sessions[0], review);
  const draft = { ...review, status: "Draft", submittedAt: null };
  assert.deepEqual(
    deserializeReviews(JSON.stringify({ schemaVersion: 1, sessions: [draft] }))
      ?.sessions[0],
    draft,
  );
  assert.equal(JSON.stringify(review), before);
  for (const placeholder of [
    "",
    "  ",
    "N/A",
    "n.a.",
    "NA",
    "—",
    "Not applicable",
    "None",
    "Unassigned",
    "Not specified",
    "TBD",
  ]) {
    assert.equal(hasFollowUpText(placeholder), false, placeholder);
    assert.equal(responsibleLabel(placeholder), "Unassigned");
    assert.equal(followUpLabel(placeholder), "Not specified");
  }
  assert.equal(
    responsibleLabel("Demo OT engineering lead"),
    "Demo OT engineering lead",
  );
});

test("summary renders open discrepancies despite Pass and keeps free-text notes separate from system findings", () => {
  const html = renderToStaticMarkup(
    createElement(ReviewSummary, { review: legacy() }),
  );
  assert.ok(
    html.includes(
      "3 unresolved exceptions remain despite human Pass responses",
    ),
  );
  assert.ok(html.includes("Technician-entered notes"));
  assert.ok(html.includes("Full pass."));
  assert.ok(html.includes("Unassigned") && html.includes("Not specified"));
  assert.ok(html.includes("Unresolved exceptions &amp; follow-up"));
  assert.ok(html.includes(AUTHORIZATION_STATEMENT));
  assert.ok(html.includes("unverified typed information"));
  assert.ok(
    html.includes("Actual inspection record created") &&
      html.includes("Simulated monitoring time"),
  );
  assert.ok(
    !/Overall (Pass|Fail)|Ready for use|Approved|Certified|All systems (are )?normal/.test(
      html,
    ),
  );
  for (const item of otTemplate.items)
    assert.ok(html.includes(item.title.replaceAll("&", "&amp;")));
});

test("summary does not truncate long findings, ownership, follow-up or technician notes", () => {
  const { review } = sample();
  const long = "Detailed synthetic observation retained in full. ".repeat(100);
  review.summary = long + "END-OF-NOTES";
  review.exceptions[0] = {
    ...review.exceptions[0],
    observation: long + "END-OF-FINDING",
    responsible: long + "END-OF-OWNER",
    followUp: long + "END-OF-ACTION",
  };
  const html = renderToStaticMarkup(createElement(ReviewSummary, { review }));
  for (const ending of [
    "END-OF-NOTES",
    "END-OF-FINDING",
    "END-OF-OWNER",
    "END-OF-ACTION",
  ])
    assert.ok(html.includes(long + ending));
});

test("compact Detailed Record preserves every frozen reading, quality, alarm, maintenance record and carried issue", () => {
  const review = freeze(sample().review),
    before = JSON.stringify(review);
  for (const response of Object.values(review.responses)) {
    const html = renderToStaticMarkup(
      createElement(ReportEvidence, { evidence: response.evidence }),
    );
    for (const asset of response.evidence.assets) {
      assert.ok(html.includes(asset.id));
      assert.ok(html.includes(asset.location));
      for (const reading of asset.readings) {
        assert.ok(html.includes(reading.pointId));
        assert.ok(html.includes(reading.label));
        assert.ok(html.includes(String(reading.value)));
        assert.ok(html.includes(reading.quality));
      }
      for (const alarm of asset.alarms)
        assert.ok(html.includes(alarm.title) && html.includes(alarm.id));
      for (const maintenance of asset.maintenance)
        assert.ok(
          html.includes(maintenance.summary) &&
            html.includes(maintenance.nextServiceDate),
        );
    }
    for (const issue of response.evidence.issues)
      assert.ok(html.includes(issue.title));
  }
  assert.equal(JSON.stringify(review), before);
});

test("new saves and submission reject placeholder follow-up for discrepancies, including human Pass", () => {
  const { review, current } = sample();
  const draft: ReviewSession = {
    ...review,
    status: "Draft",
    submittedAt: null,
  };
  for (const [field, value] of [
    ["responsible", "N/A"],
    ["followUp", "Not specified"],
  ]) {
    const response = {
      ...draft.responses[otTemplate.items[0].id],
      [field]: value,
    };
    const result = saveResponse(
      draft,
      otTemplate.items[0].id,
      response,
      current[otTemplate.items[0].id],
      clock,
    );
    assert.ok(result.errors.some((error) => error.includes("placeholders")));
    const invalidDraft = {
      ...draft,
      responses: { ...draft.responses, [response.itemId]: response },
    };
    assert.ok(
      submitReview(invalidDraft, current, clock).errors.some((error) =>
        error.includes("placeholders"),
      ),
    );
  }
});
