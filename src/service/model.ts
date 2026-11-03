import type { ReviewSession } from "../reviews/types";
import type { FollowUp } from "../followups/types";
import { registryAsset } from "./registry";
import { utcTime, validDate, validAmount } from "./coverage";
import { availabilities, caseStatuses, quoteStatuses, approvalStatuses, type ServiceCase, type CaseInput, type ServiceClock, type LifecycleRecord, type CaseEvent, type Quotation, type Approval, type CaseStatus } from "./types";
export type Errors = Record<string,string>;
export const meaningful = (value: string) => value.trim().length >= 3 && !/^(n\/?a|none|unknown|tbd|-)$/i.test(value.trim());
export function lifecycleErrors(record: LifecycleRecord): Errors {
  const errors: Errors = {};
  if (!registryAsset(record.assetId)) errors.assetId="Select a registered asset.";
  if (!availabilities.includes(record.availability)) errors.availability="Select reported availability.";
  const dates = ["purchaseDate","commissioningDate","warrantyStart","warrantyEnd","contractStart","contractEnd"] as const;
  for (const key of dates) if (record[key] && !validDate(record[key])) errors[key]="Use a valid calendar date.";
  for (const [start,end] of [["warrantyStart","warrantyEnd"],["contractStart","contractEnd"]] as const) {
    if (record[start] && record[end] && record[start] > record[end]) errors[end]="End date must be on or after the effective start.";
  }
  if (record.purchaseDate && record.commissioningDate && record.purchaseDate > record.commissioningDate) errors.commissioningDate="Commissioning cannot precede the recorded purchase.";
  if (!["","AMC","CMC","Other"].includes(record.contractType)) errors.contractType="Choose a valid contract type.";
  return errors;
}
export function caseErrors(input: CaseInput, references?: {reviews: readonly ReviewSession[]; followups: readonly FollowUp[]}): Errors {
  const errors: Errors = {};
  if (!registryAsset(input.assetId)) errors.assetId="Select a registered asset.";
  for (const field of ["title","problem","responsible"] as const) if (!meaningful(input[field])) errors[field]="Enter at least three meaningful characters.";
  if (!utcTime(input.reportedAt)) errors.reportedAt="Enter a valid reported date and time.";
  if (!availabilities.includes(input.availability)) errors.availability="Select reported availability.";
  if (references) {
    const review = references.reviews.find(r => r.id===input.reviewId && r.status==="Submitted");
    const exception = review?.exceptions.find(e => e.id===input.exceptionId);
    if ((input.reviewId || input.exceptionId) && (!review || !exception || exception.assetId!==input.assetId)) errors.reviewId="Choose a submitted exception for this asset; scope-only findings cannot bind an asset.";
    const action = references.followups.find(f => f.id===input.followUpId);
    if (input.followUpId && (!action || action.assetId!==input.assetId || (input.reviewId && (action.sourceReviewId!==input.reviewId || action.sourceExceptionId!==input.exceptionId)))) errors.followUpId="The follow-up must reference this asset and the selected source exception.";
  }
  return errors;
}
function event(clock: ServiceClock, kind: CaseEvent["kind"], text: string, actor: string, extra: Partial<CaseEvent> = {}): CaseEvent {
  const at = clock.now(); if (!utcTime(at)) throw Error("The actual record clock is invalid. Nothing was saved.");
  return {id:`SE-${clock.id()}`,at,kind,text,actor:actor.trim(),...extra};
}
function append(record: ServiceCase, item: CaseEvent, patch: Partial<ServiceCase> = {}): ServiceCase {
  if (item.at < record.updatedAt) throw Error("The actual record clock precedes the last update. Nothing was saved.");
  return {...record,...patch,updatedAt:item.at,events:[...record.events,item]};
}
export function createCase(input: CaseInput, clock: ServiceClock): ServiceCase {
  if (Object.keys(caseErrors(input)).length) throw Error("Complete the required case fields.");
  const item=event(clock,"Case created",`Issue reported: ${input.problem}`,input.responsible,{to:"Reported"});
  return {...input,title:input.title.trim(),problem:input.problem.trim(),responsible:input.responsible.trim(),id:`SC-${clock.id()}`,status:"Reported",createdAt:item.at,updatedAt:item.at,origin:"User record",quotations:[],approvals:[],events:[item]};
}
export function editCase(record: ServiceCase, input: CaseInput, note: string, actor: string, clock: ServiceClock): ServiceCase {
  if (record.status==="Closed administratively") throw Error("Reopen the case before editing its details.");
  if (input.assetId!==record.assetId || Object.keys(caseErrors(input)).length || !meaningful(note)) throw Error("Keep the asset binding and explain the details update.");
  const changes = (Object.keys(input) as (keyof CaseInput)[]).filter(key => input[key]!==record[key]).map(key => `${key}: ${record[key] || "Not recorded"} → ${input[key] || "Not recorded"}`).join("; ");
  if (!changes) throw Error("No case details changed.");
  return append(record,event(clock,"Case details updated",`${note.trim()} · ${changes}`,actor),input);
}
export function changeStatus(record: ServiceCase, to: CaseStatus, note: string, actor: string, clock: ServiceClock): ServiceCase {
  if (!caseStatuses.includes(to) || to===record.status) throw Error("Choose a different valid case status.");
  if (!meaningful(note)) throw Error("Explain this status change, including completion, closure or reopening decisions.");
  return append(record,event(clock,"Status changed",note.trim(),actor,{from:record.status,to}),{status:to});
}
export function addNote(record: ServiceCase, kind: "Progress note added" | "Vendor contact recorded", note: string, actor: string, contactDate: string, clock: ServiceClock): ServiceCase {
  if (record.status==="Closed administratively") throw Error("Reopen the case to record further work.");
  if (!meaningful(note)) throw Error("Enter a meaningful recorded observation or response.");
  if (kind==="Vendor contact recorded" && !validDate(contactDate)) throw Error("Enter the reported vendor-contact date.");
  return append(record,event(clock,kind,kind==="Vendor contact recorded" ? `Reported contact date ${contactDate}. ${note.trim()}` : note.trim(),actor));
}
export function quotationErrors(quote: Omit<Quotation,"id">): Errors {
  const errors: Errors = {};
  for (const key of ["reference","provider","description"] as const) if (!meaningful(quote[key])) errors[key]="Enter a meaningful quotation detail.";
  if (!validAmount(quote.amount)) errors.amount="Enter a positive amount, up to 12 digits and two decimal places.";
  if (!/^[A-Z]{3}$/.test(quote.currency)) errors.currency="Use a three-letter currency code.";
  else { try { new Intl.NumberFormat("en",{style:"currency",currency:quote.currency}); } catch { errors.currency="Invalid currency code."; } }
  if (!quoteStatuses.includes(quote.status)) errors.status="Choose a quotation status.";
  if (!validDate(quote.date)) errors.date="Enter the quotation date.";
  if (quote.expires && (!validDate(quote.expires) || quote.expires<quote.date)) errors.expires="Expiry must be on or after quotation date.";
  return errors;
}
export function addQuotation(record: ServiceCase, input: Omit<Quotation,"id">, actor: string, clock: ServiceClock): ServiceCase {
  if (record.status==="Closed administratively") throw Error("Reopen the case before recording a quotation.");
  if (Object.keys(quotationErrors(input)).length) throw Error("Correct the quotation fields.");
  if (record.quotations.some(q=>q.reference.trim().toLowerCase()===input.reference.trim().toLowerCase() && q.provider.trim().toLowerCase()===input.provider.trim().toLowerCase())) throw Error("This provider/reference is already recorded.");
  if (input.status==="Selected" && record.quotations.some(q=>q.status==="Selected")) throw Error("Mark the currently selected quotation Not selected first.");
  const quote = {...input,id:`SQ-${clock.id()}`};
  return append(record,event(clock,"Quotation added",`${quote.reference} · ${quote.provider} · ${quote.currency} ${quote.amount} · ${quote.status}`,actor,{referenceId:quote.id}),{quotations:[...record.quotations,quote]});
}
export function quoteStatus(record: ServiceCase, id: string, status: Quotation["status"], note: string, actor: string, clock: ServiceClock): ServiceCase {
  const quote=record.quotations.find(q=>q.id===id);
  if (record.status==="Closed administratively" || !quote || !quoteStatuses.includes(status) || quote.status===status || !meaningful(note)) throw Error("Choose a different quotation status and explain the update on an open case.");
  if (status==="Selected" && record.quotations.some(q=>q.id!==id && q.status==="Selected")) throw Error("Only one quotation may be selected. Update the previous selection first.");
  return append(record,event(clock,"Quotation status changed",`${quote.reference}: ${quote.status} → ${status}. ${note.trim()}`,actor,{referenceId:id}),{quotations:record.quotations.map(q=>q.id===id?{...q,status}:q)});
}
export function addApproval(record: ServiceCase, input: Omit<Approval,"id"|"recordedAt">, actor: string, clock: ServiceClock): ServiceCase {
  if (record.status==="Closed administratively" || !record.quotations.some(q=>q.id===input.quotationId) || !approvalStatuses.includes(input.status) || !validDate(input.date) || !meaningful(input.decisionMaker) || !meaningful(input.notes)) throw Error("Choose a recorded quotation and enter decision date, typed decision-maker and notes on an open case.");
  const decision={...input,id:`SA-${clock.id()}`,recordedAt:clock.now()};
  return append(record,event(clock,"Approval decision recorded",`${input.status} · Decision date ${input.date} · ${input.decisionMaker} (typed, unverified). ${input.notes}`,actor,{referenceId:decision.id}),{approvals:[...record.approvals,decision]});
}
export function latestApproval(record: ServiceCase, quoteId?: string) { return record.approvals.filter(a=>!quoteId || a.quotationId===quoteId).at(-1); }
export function nextAction(record: ServiceCase) {
  if(record.status==="Closed administratively") return "Review the recorded closure; reopen if further coordination is required.";
  if(record.status==="Work reported complete") return "Arrange independent readiness assessment; record administrative closure only when appropriate.";
  if(record.blocker) return record.blocker;
  return ({Reported:"Record the next engineering or provider action.","Awaiting vendor response":"Record the provider response or follow-up contact.","Awaiting quotation":"Record a provider quotation and its scope.","Awaiting approval":"Record the administrative decision and typed decision-maker.","Service in progress":"Document service progress and outstanding work."} as Record<string,string>)[record.status];
}
