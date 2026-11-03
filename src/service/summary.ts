import { registryAsset } from "./registry";
import { assetCoverage } from "./coverage";
import { latestApproval, nextAction } from "./model";
import type { LifecycleRecord, ServiceCase } from "./types";
export function serviceSummary(record:ServiceCase,lifecycle:LifecycleRecord,today:string){
  const asset=registryAsset(record.assetId);if(!asset||lifecycle.assetId!==record.assetId)throw Error("Summary asset identity mismatch");
  const quotation=record.quotations.find(q=>q.status==="Selected")??record.quotations.at(-1);
  return {record,lifecycle,asset,coverage:assetCoverage(lifecycle,today),today,quotation,approval:quotation?latestApproval(record,quotation.id):undefined,events:record.events.slice(-4),omittedEvents:Math.max(0,record.events.length-4),nextAction:nextAction(record)};
}
