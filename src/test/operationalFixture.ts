import { demoSnapshot } from "../data/demo";
import {
  initialOverlay,
  createSimulationReducer,
  effectiveSnapshot,
} from "../simulation/model";
import { focusedTemplate } from "../reviews/focused";
import { captureEvidence } from "../reviews/evidence";
import { createReview, saveResponse, submitReview } from "../reviews/model";
import { blankVerification } from "../reviews/types";
import { createFollowUp, updateFollowUp } from "../followups/model";
import { emptyFollowUps } from "../followups/persistence";
let serial = 0;
export const testActionClock = {
  now: () => "2026-10-29T03:00:00.000Z",
  id: () => `TEST-${++serial}`,
};
export function operationalFixture() {
  const overlay = createSimulationReducer(demoSnapshot)(
    initialOverlay(demoSnapshot),
    { type: "ACTIVATE_FAULT" },
  );
  const snapshot = effectiveSnapshot(demoSnapshot, overlay),
    template = focusedTemplate(snapshot, "AHU-OT-01"),
    clock = {
      now: testActionClock.now,
      id: () => `REV-${testActionClock.id()}`,
    };
  let review = createReview(
    template,
    {
      technician: "Synthetic QA",
      role: "Demo facilities engineer",
      openingNotes: "Synthetic tests",
      subjectAssetId: "AHU-OT-01",
    },
    clock,
  );
  const current = Object.fromEntries(
    template.items.map((item) => [
      item.id,
      captureEvidence(item, template, snapshot, [], clock.now()),
    ]),
  );
  for (const item of template.items)
    review = saveResponse(
      review,
      item.id,
      {
        ...blankVerification(),
        choice: "Attention",
        method: "Other",
        observation:
          "Synthetic evidence review only; Critical condition remains unresolved.",
        responsible: "Demo engineer",
        followUp: "Investigate the recorded indication.",
        gaps: [],
        acknowledgedIssues: [],
      },
      current[item.id],
      clock,
    ).review;
  review = submitReview(review, current, clock).review;
  let action = createFollowUp(
    emptyFollowUps(),
    review,
    review.exceptions[0].id,
    {
      responsible: "Demo engineer",
      proposedAction: "Inspect the synthetic filter indication.",
    },
    testActionClock,
  ).record!;
  const opened = action;
  action = updateFollowUp(
    action,
    {
      responsible: action.responsible,
      proposedAction: action.proposedAction,
      status: "In Progress",
      note: "Synthetic investigation progress.",
    },
    testActionClock,
  ).record;
  action = updateFollowUp(
    action,
    {
      responsible: action.responsible,
      proposedAction: action.proposedAction,
      status: "Action Completed",
      note: "Synthetic action documented. Independent verification still required.",
    },
    testActionClock,
  ).record;
  return { overlay, snapshot, review, action, opened };
}
