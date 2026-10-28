import type { ReviewSession } from "../reviews/types";
import { hasFollowUpText } from "../reviews/followUp";
import {
  followUpStatuses,
  type ActionClock,
  type FollowUp,
  type FollowUpStatus,
  type FollowUpStore,
} from "./types";

export const sourceKey = (reviewId: string, exceptionId: string) =>
  `${reviewId}::${exceptionId}`;
export const validTransition = (from: FollowUpStatus, to: FollowUpStatus) =>
  (from === "Open" && to === "In Progress") ||
  (from === "In Progress" && to === "Action Completed");
export function createFollowUp(
  store: FollowUpStore,
  review: ReviewSession,
  exceptionId: string,
  input: { responsible: string; proposedAction: string },
  clock: ActionClock,
) {
  const existing = store.records.find(
    (record) =>
      sourceKey(record.sourceReviewId, record.sourceExceptionId) ===
      sourceKey(review.id, exceptionId),
  );
  if (existing) return { store, record: existing, errors: [] };
  const exception = review.exceptions.find(
    (exception) => exception.id === exceptionId,
  );
  const errors: string[] = [];
  if (
    review.status !== "Submitted" ||
    !exception ||
    exception.status !== "Open"
  )
    errors.push("Choose an unresolved exception from a submitted review.");
  if (
    !hasFollowUpText(input.responsible) ||
    !hasFollowUpText(input.proposedAction)
  )
    errors.push(
      "A responsible role/person and a meaningful proposed action are required.",
    );
  if (errors.length || !exception) return { store, record: null, errors };
  const at = clock.now();
  const record: FollowUp = {
    id: `FU-${clock.id()}`,
    sourceReviewId: review.id,
    sourceExceptionId: exception.id,
    assetId: exception.assetId,
    description: exception.observation || exception.itemTitle,
    responsible: input.responsible.trim(),
    proposedAction: input.proposedAction.trim(),
    status: "Open",
    createdAt: at,
    updatedAt: at,
    progressNotes: [],
    history: [
      {
        id: `FUE-${clock.id()}`,
        from: null,
        to: "Open",
        at,
        note: "Follow-up created from the submitted exception.",
      },
    ],
  };
  return {
    store: { ...store, records: [record, ...store.records] },
    record,
    errors: [],
  };
}
export function updateFollowUp(
  record: FollowUp,
  input: {
    responsible: string;
    proposedAction: string;
    status: FollowUpStatus;
    note: string;
  },
  clock: ActionClock,
) {
  const errors: string[] = [];
  if (record.status === "Action Completed")
    errors.push(
      "Completed actions are read-only. Create a new review for re-verification.",
    );
  if (!followUpStatuses.includes(input.status))
    errors.push("Choose a valid action status.");
  if (
    !hasFollowUpText(input.responsible) ||
    !hasFollowUpText(input.proposedAction)
  )
    errors.push(
      "A responsible role/person and meaningful proposed action are required.",
    );
  if (
    record.status !== input.status &&
    !validTransition(record.status, input.status)
  )
    errors.push(
      "Move actions from Open to In Progress, then to Action Completed.",
    );
  if (input.status === "Action Completed" && !hasFollowUpText(input.note))
    errors.push(
      "A completion note describing the recorded action is required.",
    );
  if (errors.length) return { record, errors };
  const changed = record.status !== input.status;
  if (
    !changed &&
    record.responsible === input.responsible.trim() &&
    record.proposedAction === input.proposedAction.trim() &&
    !input.note.trim()
  )
    return {
      record,
      errors: [
        "Enter a progress note, update the action details or change status.",
      ],
    };
  const at = clock.now();
  return {
    record: {
      ...record,
      responsible: input.responsible.trim(),
      proposedAction: input.proposedAction.trim(),
      status: input.status,
      updatedAt: at,
      progressNotes: input.note.trim()
        ? [
            ...record.progressNotes,
            { id: `FUN-${clock.id()}`, text: input.note.trim(), at },
          ]
        : [...record.progressNotes],
      history: changed
        ? [
            ...record.history,
            {
              id: `FUE-${clock.id()}`,
              from: record.status,
              to: input.status,
              at,
              note: input.note.trim(),
            },
          ]
        : [...record.history],
    },
    errors: [],
  };
}
