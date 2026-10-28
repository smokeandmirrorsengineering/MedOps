import type { SimulationStorage } from "../simulation/persistence";
import { hasFollowUpText } from "../reviews/followUp";
import { sourceKey, validTransition } from "./model";
import {
  followUpStatuses,
  isActualRecordTime,
  type FollowUp,
  type FollowUpStore,
} from "./types";
export const FOLLOW_UP_KEY = "evidanor:followups:v1";
export const emptyFollowUps = (): FollowUpStore => ({
  schemaVersion: 1,
  records: [],
});
const obj = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string";
const date = isActualRecordTime;
export function validFollowUp(value: unknown): value is FollowUp {
  if (
    !obj(value) ||
    !text(value.id) ||
    !/^FU-[A-Za-z0-9-]+$/.test(value.id) ||
    !text(value.sourceReviewId) ||
    !/^REV-/.test(value.sourceReviewId) ||
    !text(value.sourceExceptionId) ||
    !value.sourceExceptionId.startsWith(value.sourceReviewId + "|") ||
    !(
      value.assetId === null ||
      (text(value.assetId) && !!value.assetId.trim())
    ) ||
    !text(value.description) ||
    !value.description.trim() ||
    !text(value.responsible) ||
    !hasFollowUpText(value.responsible) ||
    !text(value.proposedAction) ||
    !hasFollowUpText(value.proposedAction) ||
    !followUpStatuses.includes(value.status as never) ||
    !date(value.createdAt) ||
    !date(value.updatedAt) ||
    value.createdAt > value.updatedAt ||
    !Array.isArray(value.progressNotes) ||
    !Array.isArray(value.history) ||
    !value.history.length
  )
    return false;
  const notes = value.progressNotes;
  if (
    !notes.every(
      (note) =>
        obj(note) &&
        text(note.id) &&
        text(note.text) &&
        !!note.text.trim() &&
        date(note.at) &&
        note.at >= value.createdAt! &&
        note.at <= value.updatedAt!,
    )
  )
    return false;
  if (new Set(notes.map((note) => note.id)).size !== notes.length) return false;
  for (let index = 0; index < value.history.length; index++) {
    const event = value.history[index],
      previous = value.history[index - 1];
    if (
      !obj(event) ||
      !text(event.id) ||
      !text(event.note) ||
      !date(event.at) ||
      event.at < value.createdAt ||
      event.at > value.updatedAt
    )
      return false;
    if (
      index === 0
        ? event.from !== null ||
          event.to !== "Open" ||
          event.at !== value.createdAt
        : event.from !== previous.to ||
          !validTransition(event.from as never, event.to as never) ||
          event.at < previous.at
    )
      return false;
    if (event.to === "Action Completed" && !hasFollowUpText(event.note))
      return false;
  }
  return (
    new Set(value.history.map((event) => event.id)).size ===
      value.history.length && value.history.at(-1).to === value.status
  );
}
export function deserializeFollowUps(raw: string): FollowUpStore | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !obj(value) ||
      value.schemaVersion !== 1 ||
      !Array.isArray(value.records) ||
      !value.records.every(validFollowUp)
    )
      return null;
    return new Set(value.records.map((record) => record.id)).size ===
      value.records.length &&
      new Set(
        value.records.map((record) =>
          sourceKey(record.sourceReviewId, record.sourceExceptionId),
        ),
      ).size === value.records.length
      ? (value as unknown as FollowUpStore)
      : null;
  } catch {
    return null;
  }
}
export function readFollowUps(storage: SimulationStorage | undefined) {
  try {
    if (!storage)
      return { store: emptyFollowUps(), status: "unavailable" as const };
    const raw = storage.getItem(FOLLOW_UP_KEY);
    if (raw === null)
      return { store: emptyFollowUps(), status: "saved" as const };
    const store = deserializeFollowUps(raw);
    return store
      ? { store, status: "saved" as const }
      : { store: emptyFollowUps(), status: "recovered" as const };
  } catch {
    return { store: emptyFollowUps(), status: "unavailable" as const };
  }
}
export function writeFollowUps(
  storage: SimulationStorage | undefined,
  store: FollowUpStore,
) {
  try {
    if (!storage) return false;
    storage.setItem(FOLLOW_UP_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}
