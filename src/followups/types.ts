export const followUpStatuses = [
  "Open",
  "In Progress",
  "Action Completed",
] as const;
export type FollowUpStatus = (typeof followUpStatuses)[number];
export interface FollowUpHistory {
  id: string;
  from: FollowUpStatus | null;
  to: FollowUpStatus;
  at: string;
  note: string;
}
export interface FollowUp {
  id: string;
  sourceReviewId: string;
  sourceExceptionId: string;
  assetId: string | null;
  description: string;
  responsible: string;
  proposedAction: string;
  status: FollowUpStatus;
  progressNotes: { id: string; text: string; at: string }[];
  createdAt: string;
  updatedAt: string;
  history: FollowUpHistory[];
}
export interface FollowUpStore {
  schemaVersion: 1;
  records: FollowUp[];
}
export interface ActionClock {
  now(): string;
  id(): string;
}
export const actionClock: ActionClock = {
  now: () => new Date().toISOString(),
  id: () => crypto.randomUUID(),
};
export const isActualRecordTime = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d\d-\d\dT.*Z$/.test(value) &&
  Number.isFinite(Date.parse(value));
export const COMPLETION_LABEL =
  "Action recorded · Equipment condition not re-verified";
