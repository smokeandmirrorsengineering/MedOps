import type { Condition, OperatingState, Quality } from "../domain/types";

export const choices = [
  "Pass",
  "Attention",
  "Fail",
  "Unable to Verify",
  "Not Applicable",
] as const;
export type Choice = (typeof choices)[number];
export const methods = [
  "Local panel viewed",
  "Maintenance logbook sighted",
  "Visual inspection",
  "Handheld instrument used",
  "Not physically accessible",
  "Other",
] as const;
export type Method = (typeof methods)[number];
export interface TemplateItem {
  id: string;
  section: string;
  order: number;
  title: string;
  prompt: string;
  kind: "equipment" | "human" | "gaps" | "issues";
  assetIds: string[];
  pointLabels: string[];
  humanOnly: boolean;
  limitation: string;
  allowedResponses: Choice[];
  allowedMethods: Method[];
  rules: {
    observationOnAbnormal: boolean;
    reconcilePassConflict: boolean;
    tolerances: Record<string, number>;
  };
}
export interface ReviewTemplate {
  id: string;
  version: string;
  title: string;
  scopeId: string;
  scope: string;
  disclaimer: string;
  scopeAssetIds: string[];
  items: TemplateItem[];
}
export interface EvidenceAsset {
  id: string;
  name: string;
  location: string;
  condition: Condition;
  operatingState: OperatingState;
  method: string;
  connectivity: string;
  source: string;
  reasons: string[];
  readings: {
    pointId: string;
    label: string;
    value: number | null;
    unit: string;
    quality: Quality;
    timestamp: string;
    validity:
      | "Current simulated"
      | "Recorded inspection"
      | "Last known / unavailable"
      | "Stale";
  }[];
  alarms: { id: string; title: string; severity: string; timestamp: string }[];
  maintenance: {
    lastServiceDate: string;
    nextServiceDate: string;
    summary: string;
  }[];
}
export interface CarriedIssue {
  key: string;
  source: "Review exception" | "Synthetic alarm";
  title: string;
  observation: string;
  assetId: string | null;
  reviewId: string | null;
}
export interface EvidenceSnapshot {
  simulatedAt: string;
  capturedAt: string;
  assets: EvidenceAsset[];
  issues: CarriedIssue[];
}
export interface HumanVerification {
  choice: Choice | "";
  method: Method | "";
  observation: string;
  notes: string;
  reconciliation: string;
  responsible: string;
  followUp: string;
}
export interface GapVerification extends HumanVerification {
  assetId: string;
}
export interface ItemResponse extends HumanVerification {
  itemId: string;
  savedAt: string;
  evidence: EvidenceSnapshot;
  gaps: GapVerification[];
  acknowledgedIssues: string[];
  changeAcknowledgement: {
    evidence: EvidenceSnapshot;
    note: string;
    notedAt: string;
    changes: string[];
  } | null;
}
export type IssueType =
  | "Attention"
  | "Fail"
  | "Unable to Verify"
  | "Evidence discrepancy"
  | "Evidence changed";
export interface ReviewException {
  id: string;
  reviewId: string;
  itemId: string;
  itemTitle: string;
  assetId: string | null;
  assetName: string | null;
  issueType: IssueType;
  observation: string;
  responsible: string;
  followUp: string;
  status: "Open";
}
export interface ReviewSession {
  id: string;
  template: ReviewTemplate;
  scopeId: string;
  scope: string;
  technician: string;
  role: string;
  openingNotes: string;
  summary: string;
  status: "Draft" | "Submitted";
  createdAt: string;
  submittedAt: string | null;
  responses: Record<string, ItemResponse>;
  exceptions: ReviewException[];
}
export interface ReviewStore {
  schemaVersion: 1;
  sessions: ReviewSession[];
}
export interface ReviewClock {
  now(): string;
  id(): string;
}
export const reviewClock: ReviewClock = {
  now: () => new Date().toISOString(),
  id: () => `REV-${crypto.randomUUID()}`,
};
export const blankVerification = (): HumanVerification => ({
  choice: "",
  method: "",
  observation: "",
  notes: "",
  reconciliation: "",
  responsible: "",
  followUp: "",
});
export const AUTHORIZATION_STATEMENT =
  "Operational authorization is not recorded in MedOps and remains the responsibility of authorized personnel.";
