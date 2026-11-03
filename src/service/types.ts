export const availabilities = ["Operational, reported", "Limited use, reported", "Out of service, reported", "Not recorded"] as const;
export type Availability = typeof availabilities[number];
export const caseStatuses = ["Reported", "Awaiting vendor response", "Awaiting quotation", "Awaiting approval", "Service in progress", "Work reported complete", "Closed administratively"] as const;
export type CaseStatus = typeof caseStatuses[number];
export const quoteStatuses = ["Received", "Under review", "Selected", "Not selected"] as const;
export const approvalStatuses = ["Not requested", "Pending", "Approved, as recorded", "Rejected, as recorded", "More information requested"] as const;
export interface RegistryAsset { id: string; name: string; category: string; department: string; location: string; monitored: boolean; manufacturer: string; model: string }
export interface LifecycleRecord {
  assetId: string; manufacturer: string; model: string; serial: string; supplier: string;
  purchaseDate: string; commissioningDate: string; warrantyStart: string; warrantyEnd: string; warrantyTerms: string;
  contractType: "" | "AMC" | "CMC" | "Other"; contractStart: string; contractEnd: string; contractTerms: string;
  contact: string; documentReference: string; notes: string; availability: Availability;
  updatedAt: string | null; origin: "Synthetic seed" | "User record";
}
export interface Quotation { id: string; reference: string; provider: string; description: string; amount: string; currency: string; date: string; expires: string; coverageNotes: string; status: typeof quoteStatuses[number] }
export interface Approval { id: string; quotationId: string; status: typeof approvalStatuses[number]; date: string; decisionMaker: string; notes: string; recordedAt: string }
export const eventKinds = ["Case created", "Case details updated", "Status changed", "Vendor contact recorded", "Progress note added", "Quotation added", "Quotation status changed", "Approval decision recorded"] as const;
export interface CaseEvent { id: string; at: string; actor: string; kind: typeof eventKinds[number]; text: string; from?: CaseStatus; to?: CaseStatus; referenceId?: string }
export interface ServiceCase {
  id: string; assetId: string; title: string; problem: string; reportedAt: string; availability: Availability; responsible: string; status: CaseStatus;
  provider: string; supplierReference: string; issueCategory: string; parts: string; blocker: string; engineeringNotes: string;
  reviewId: string; exceptionId: string; followUpId: string;
  createdAt: string; updatedAt: string; origin: "Synthetic seed" | "User record";
  quotations: Quotation[]; approvals: Approval[]; events: CaseEvent[];
}
export type CaseInput = Pick<ServiceCase, "assetId" | "title" | "problem" | "reportedAt" | "availability" | "responsible" | "provider" | "supplierReference" | "issueCategory" | "parts" | "blocker" | "engineeringNotes" | "reviewId" | "exceptionId" | "followUpId">;
export const caseInputFields = ["assetId","title","problem","reportedAt","availability","responsible","provider","supplierReference","issueCategory","parts","blocker","engineeringNotes","reviewId","exceptionId","followUpId"] as const;
export function caseInput(record:CaseInput):CaseInput {return Object.fromEntries(caseInputFields.map(key=>[key,record[key]])) as unknown as CaseInput;}
export interface LifecycleStore { schemaVersion: 1; records: LifecycleRecord[] }
export interface CaseStore { schemaVersion: 1; cases: ServiceCase[] }
export interface ServiceClock { now(): string; id(): string }
export const serviceClock: ServiceClock = { now: () => new Date().toISOString(), id: () => crypto.randomUUID() };
export const ADMIN_NOTICE = "Administrative case completion does not establish equipment readiness or authorized return to service.";
