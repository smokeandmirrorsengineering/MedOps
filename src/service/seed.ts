import type { CaseInput, CaseStore, ServiceClock } from "./types";
import { createCase, changeStatus, addQuotation, addApproval } from "./model";
export function seedCases(): CaseStore {
  let counter=0;
  const clock: ServiceClock = {now:()=>"2026-11-02T04:00:00.000Z",id:()=>`DEMO-${++counter}`};
  const input: CaseInput = {assetId:"CT-RAD-01",title:"CT service coordination — quotation pending decision",problem:"Synthetic incident: intermittent startup failure reported by the fictional department. No diagnostics or actual repair has been performed in Evidanor.",reportedAt:"2026-11-02T03:00:00.000Z",availability:"Out of service, reported",responsible:"Demo biomedical engineering lead",provider:"Fictional Delta Imaging Services",supplierReference:"DEMO-DELTA-CT-17",issueCategory:"Reported equipment interruption",parts:"Provider assessment required; no part identified by Evidanor.",blocker:"Engineering management to review the fictional quotation and record an administrative decision.",engineeringNotes:"All dates, providers, amounts and events are deterministic synthetic demonstration entries.",reviewId:"",exceptionId:"",followUpId:""};
  let ct=createCase(input,clock); ct={...ct,id:"SC-DEMO-CT-001",origin:"Synthetic seed"};
  ct=addQuotation(ct,{reference:"DEMO-Q-CT-2026-01",provider:"Fictional Delta Imaging Services",description:"Fictional assessment visit and proposed service scope, subject to confirmation. No diagnostic or repair instruction.",amount:"185000.00",currency:"BDT",date:"2026-11-02",expires:"2026-11-30",coverageNotes:"Recorded contract expired. Coverage and payable scope require manual confirmation. Fictional price, not a market rate.",status:"Under review"},"Demo scenario author",clock);
  ct=addApproval(ct,{quotationId:ct.quotations[0].id,status:"Pending",date:"2026-11-02",decisionMaker:"Demo engineering management role",notes:"Fictional administrative review pending; no authenticated authorization or purchase."},"Demo scenario author",clock);
  ct=changeStatus(ct,"Awaiting approval","Synthetic case is waiting on a recorded administrative decision; vendor contact is not asserted.","Demo scenario author",clock);
  let mri=createCase({...input,assetId:"MRI-RAD-01",title:"MRI service-provider response outstanding",problem:"Synthetic report: a department-requested service assessment is pending. No connected readings or fault diagnosis exists.",availability:"Limited use, reported",provider:"Fictional Northstar Technical Care",supplierReference:"",parts:"Not recorded",blocker:"Responsible engineer to document whether provider contact has occurred and record a response.",issueCategory:"Service assessment request"},clock);
  mri={...mri,id:"SC-DEMO-MRI-001",origin:"Synthetic seed"};
  mri=changeStatus(mri,"Awaiting vendor response","Fictional waiting state only. No vendor contact event is claimed or inferred.","Demo scenario author",clock);
  return {schemaVersion:1,cases:[ct,mri]};
}
