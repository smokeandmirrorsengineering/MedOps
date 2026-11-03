import type { SimulationStorage } from "../simulation/persistence";
import { registry, registryAsset, seedLifecycle } from "./registry";
import { seedCases } from "./seed";
import { caseErrors, lifecycleErrors, quotationErrors, meaningful } from "./model";
import { utcTime, validDate } from "./coverage";
import { caseStatuses, approvalStatuses, eventKinds, type CaseStore, type LifecycleStore, type ServiceCase, type LifecycleRecord } from "./types";
export const LIFECYCLE_KEY="evidanor:lifecycle:v1", CASES_KEY="evidanor:service-cases:v1";
const obj=(v:unknown): v is Record<string,unknown> => !!v && typeof v==="object" && !Array.isArray(v);
const unique=(values:readonly string[])=>new Set(values).size===values.length;
const fields=(v:Record<string,unknown>,keys:string[])=>keys.every(key=>typeof v[key]==="string" && (v[key] as string).length<=20000);
const origin=(v:unknown)=>v==="Synthetic seed" || v==="User record";
export function validLifecycle(v:unknown): v is LifecycleRecord {
  if(!obj(v) || !fields(v,["assetId","manufacturer","model","serial","supplier","purchaseDate","commissioningDate","warrantyStart","warrantyEnd","warrantyTerms","contractType","contractStart","contractEnd","contractTerms","contact","documentReference","notes","availability"]) || !origin(v.origin) || (v.updatedAt!==null && !utcTime(v.updatedAt))) return false;
  return Object.keys(lifecycleErrors(v as unknown as LifecycleRecord)).length===0;
}
export function validCase(v:unknown): v is ServiceCase {
  if(!obj(v) || !fields(v,["id","assetId","title","problem","reportedAt","availability","responsible","status","provider","supplierReference","issueCategory","parts","blocker","engineeringNotes","reviewId","exceptionId","followUpId"]) || !(v.id as string).startsWith("SC-") || !caseStatuses.includes(v.status as never) || !origin(v.origin) || !utcTime(v.createdAt) || !utcTime(v.updatedAt) || v.createdAt>v.updatedAt || !Array.isArray(v.events) || !v.events.length || !Array.isArray(v.quotations) || !Array.isArray(v.approvals)) return false;
  const record=v as unknown as ServiceCase;
  if(Object.keys(caseErrors(record)).length || (!!record.reviewId!==!!record.exceptionId) || (record.reviewId && !record.reviewId.startsWith("REV-")) || (record.followUpId && !record.followUpId.startsWith("FU-"))) return false;
  if(!record.quotations.every(q=>obj(q) && fields(q,["id","reference","provider","description","amount","currency","date","expires","coverageNotes","status"]) && q.id.startsWith("SQ-") && !Object.keys(quotationErrors(q)).length) || !unique(record.quotations.map(q=>q.id)) || !unique(record.quotations.map(q=>`${q.provider.trim().toLowerCase()}|${q.reference.trim().toLowerCase()}`)) || record.quotations.filter(q=>q.status==="Selected").length>1) return false;
  if(!record.approvals.every(a=>obj(a) && fields(a,["id","quotationId","status","date","decisionMaker","notes","recordedAt"]) && a.id.startsWith("SA-") && approvalStatuses.includes(a.status) && validDate(a.date) && meaningful(a.decisionMaker) && meaningful(a.notes) && utcTime(a.recordedAt) && a.recordedAt>=record.createdAt && a.recordedAt<=record.updatedAt && record.quotations.some(q=>q.id===a.quotationId)) || !unique(record.approvals.map(a=>a.id))) return false;
  let status="Reported", previous=record.createdAt;
  for(let i=0;i<record.events.length;i++) {
    const e=record.events[i];
    if(!obj(e) || !fields(e,["id","at","actor","kind","text"]) || !e.id.startsWith("SE-") || !utcTime(e.at) || e.at<previous || e.at>record.updatedAt || !eventKinds.includes(e.kind) || !meaningful(e.text)) return false;
    if(i===0 && (e.kind!=="Case created" || e.at!==record.createdAt || e.to!=="Reported" || e.from!==undefined)) return false;
    if(i>0 && e.kind==="Case created") return false;
    if(e.kind==="Status changed") { if(e.from!==status || !caseStatuses.includes(e.to as never) || e.to===e.from) return false; status=e.to!; }
    else if(i>0 && (e.from!==undefined || e.to!==undefined)) return false;
    if(["Quotation added","Quotation status changed"].includes(e.kind) && !record.quotations.some(q=>q.id===e.referenceId)) return false;
    if(e.kind==="Approval decision recorded" && !record.approvals.some(a=>a.id===e.referenceId)) return false;
    previous=e.at;
  }
  return status===record.status && previous===record.updatedAt && unique([...record.events.map(e=>e.id),...record.quotations.map(q=>q.id),...record.approvals.map(a=>a.id)]) && record.quotations.every(q=>record.events.filter(e=>e.kind==="Quotation added" && e.referenceId===q.id).length===1) && record.approvals.every(a=>record.events.filter(e=>e.kind==="Approval decision recorded" && e.referenceId===a.id).length===1);
}
export function validLifecycleStore(v:unknown): v is LifecycleStore { return obj(v) && v.schemaVersion===1 && Array.isArray(v.records) && v.records.length===registry.length && v.records.every(validLifecycle) && unique(v.records.map(r=>r.assetId)); }
export function validCaseStore(v:unknown): v is CaseStore { return obj(v) && v.schemaVersion===1 && Array.isArray(v.cases) && v.cases.every(validCase) && unique(v.cases.map(r=>r.id)) && v.cases.every(r=>!!registryAsset(r.assetId)); }
export type StorageState="ready"|"saved"|"unavailable"|"protected";
export function loadStore<T>(storage:SimulationStorage|null|undefined,key:string,valid:(v:unknown)=>v is T,seed:()=>T): {store:T; status:StorageState} {
  if(!storage) return {store:seed(),status:"unavailable"};
  try { const raw=storage.getItem(key); if(raw===null) return {store:seed(),status:"ready"}; const value:unknown=JSON.parse(raw); return valid(value)?{store:value,status:"ready"}:{store:seed(),status:"protected"}; }
  catch { try { return {store:seed(),status:storage.getItem(key)!==null?"protected":"unavailable"}; } catch {return {store:seed(),status:"unavailable"};} }
}
export const readLifecycle=(s:SimulationStorage|null|undefined)=>loadStore(s,LIFECYCLE_KEY,validLifecycleStore,seedLifecycle);
export const readCases=(s:SimulationStorage|null|undefined)=>loadStore(s,CASES_KEY,validCaseStore,seedCases);
export function saveStore<T>(storage:SimulationStorage|null|undefined,key:string,store:T,valid:(v:unknown)=>v is T): boolean { if(!storage || !valid(store)) return false; try {storage.setItem(key,JSON.stringify(store));return true;} catch{return false;} }

