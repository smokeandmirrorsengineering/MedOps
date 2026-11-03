import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from "react";
import { browserStorage } from "../simulation/persistence";
import { useReviews } from "../reviews/ReviewProvider";
import { useFollowUps } from "../followups/FollowUpProvider";
import { serviceClock, type ServiceClock, type LifecycleRecord, type CaseInput, type ServiceCase } from "./types";
import { dhakaDate, utcTime } from "./coverage";
import { caseErrors, createCase, lifecycleErrors, type Errors } from "./model";
import { CASES_KEY, LIFECYCLE_KEY, readCases, readLifecycle, saveStore, validCaseStore, validLifecycleStore, type StorageState } from "./persistence";
function useServiceState(clock:ServiceClock) {
  const reviews=useReviews(), followups=useFollowUps();
  const [initialLifecycle]=useState(()=>readLifecycle(browserStorage())), [initialCases]=useState(()=>readCases(browserStorage()));
  const [lifecycle,setLifecycle]=useState(initialLifecycle.store), [cases,setCases]=useState(initialCases.store);
  const currentLifecycle=useRef(lifecycle),currentCases=useRef(cases);
  const [lifecycleStatus,setLifecycleStatus]=useState<StorageState>(initialLifecycle.status),[caseStorageStatus,setCaseStorageStatus]=useState<StorageState>(initialCases.status);
  const [today,setToday]=useState(()=>dhakaDate(clock.now()));
  useEffect(()=>{ const refresh=()=>setToday(dhakaDate(clock.now())); const timer=window.setInterval(refresh,60000); window.addEventListener("focus",refresh); return ()=>{window.clearInterval(timer);window.removeEventListener("focus",refresh);}; },[clock]);
  return {
    lifecycle:lifecycle.records,cases:cases.cases,lifecycleStatus,caseStorageStatus,today,clock,
    saveLifecycle(record:LifecycleRecord): Errors {
      const errors=lifecycleErrors(record); if(Object.keys(errors).length) return errors;
      const at=clock.now(); if(!utcTime(at) || (record.updatedAt && at<record.updatedAt)) return {clock:"Invalid or backwards actual record clock. Nothing saved."};
      if(initialLifecycle.status==="protected") return {storage:"Stored lifecycle data is invalid or incompatible and protected from replacement. Export/recover the existing browser data before replacing this store."};
      const next={...currentLifecycle.current,records:currentLifecycle.current.records.map(r=>r.assetId===record.assetId?{...record,updatedAt:at,origin:"User record" as const}:r)};
      currentLifecycle.current=next;setLifecycle(next);const saved=saveStore(browserStorage(),LIFECYCLE_KEY,next,validLifecycleStore);setLifecycleStatus(saved?"saved":"unavailable");
      return saved?{}:{storage:"NOT SAVED TO BROWSER — edit retained in memory only; storage is unavailable or full."};
    },
    create(input:CaseInput): {id?:string;errors:Errors} {
      const errors=caseErrors(input,{reviews:reviews.sessions,followups:followups.records}); if(Object.keys(errors).length)return {errors};
      if(initialCases.status==="protected") return {errors:{storage:"Existing case data is invalid or incompatible and protected from replacement. No stored cases were overwritten."}};
      try {const record=createCase(input,clock), next={...currentCases.current,cases:[record,...currentCases.current.cases]};currentCases.current=next;setCases(next);const saved=saveStore(browserStorage(),CASES_KEY,next,validCaseStore);setCaseStorageStatus(saved?"saved":"unavailable");return {id:record.id,errors:saved?{}:{storage:"NOT SAVED TO BROWSER — this case exists in memory only."}};} catch(error){return {errors:{form:(error as Error).message}};}
    },
    update(id:string, transform:(record:ServiceCase)=>ServiceCase): Errors {
      const record=currentCases.current.cases.find(c=>c.id===id);if(!record)return {form:"Case not found in this browser."};
      if(initialCases.status==="protected")return {storage:"Existing case data is protected from replacement. Nothing saved."};
      try {const updated=transform(record); const errors=caseErrors(updated,{reviews:reviews.sessions,followups:followups.records});
        // Missing source records do not prevent progress on an already documented case.
        if((updated.reviewId!==record.reviewId || updated.exceptionId!==record.exceptionId || updated.followUpId!==record.followUpId) && Object.keys(errors).length)return errors;
        const next={...currentCases.current,cases:currentCases.current.cases.map(c=>c.id===id?updated:c)};
        if(!validCaseStore(next))return {form:"The case update failed integrity validation. Nothing changed."};
        currentCases.current=next;setCases(next);const saved=saveStore(browserStorage(),CASES_KEY,next,validCaseStore);setCaseStorageStatus(saved?"saved":"unavailable");return saved?{}:{storage:"NOT SAVED TO BROWSER — update retained in memory only."};
      } catch(error) {return {form:(error as Error).message};}
    }
  };
}
const Context=createContext<ReturnType<typeof useServiceState>|null>(null);
export function ServiceProvider({children,clock=serviceClock}:{children:ReactNode;clock?:ServiceClock}) {return <Context.Provider value={useServiceState(clock)}>{children}</Context.Provider>;}
export function useService(){const value=useContext(Context);if(!value)throw Error("ServiceProvider required");return value;}
