import type { Snapshot } from "../domain/types";
import { evaluateAsset, latestReading } from "../domain/evaluateAsset";
import type { CarriedIssue, EvidenceAsset, EvidenceSnapshot, ReviewSession, ReviewTemplate, TemplateItem } from "./types";

export function openReviewIssues(sessions: readonly ReviewSession[]) { return sessions.filter(review=>review.status==="Submitted").flatMap(review=>review.exceptions.map(exception=>({review,exception}))); }
export function carriedIssues(template:ReviewTemplate, snapshot:Snapshot, sessions:readonly ReviewSession[]):CarriedIssue[] {
  return [
    ...openReviewIssues(sessions).filter(({review})=>review.scopeId===template.scopeId).map(({review,exception})=>({key:`exception:${exception.id}`,source:"Review exception" as const,title:exception.itemTitle,observation:exception.observation,assetId:exception.assetId,reviewId:review.id})),
    ...snapshot.events.filter(event=>event.active&&template.scopeAssetIds.includes(event.assetId)).map(event=>({key:`alarm:${event.id}`,source:"Synthetic alarm" as const,title:event.title,observation:event.description,assetId:event.assetId,reviewId:null})),
  ];
}
export function captureEvidence(item:TemplateItem, template:ReviewTemplate, snapshot:Snapshot, sessions:readonly ReviewSession[], actualAt:string): EvidenceSnapshot {
  const assets:EvidenceAsset[] = item.assetIds.map(id=> {
    const asset=snapshot.assets.find(asset=>asset.id===id);
    if(!asset) throw new Error(`Mapped equipment ${id} is unavailable.`);
    const location=snapshot.locations.find(location=>location.id===asset.locationId)!;
    const evaluation=evaluateAsset(asset,snapshot,snapshot.now);
    return {id,name:asset.name,location:`${location.building} · ${location.floor} · ${location.department} · ${location.room}`,
      condition:evaluation.condition,operatingState:asset.operatingState,method:asset.monitoring.method,connectivity:asset.monitoring.connectivity,source:asset.monitoring.source,reasons:[...evaluation.reasons],
      readings:snapshot.points.filter(point=>point.assetId===id&&(!item.pointLabels.length||item.pointLabels.includes(point.label))).map(point=>{
        const reading=latestReading(snapshot.readings,id,point.id);
        const stale=!!reading&&(Date.parse(snapshot.now)-Date.parse(reading.timestamp)>asset.monitoring.expectedIntervalMinutes*60000||Date.parse(reading.timestamp)>Date.parse(snapshot.now));
        const unavailable=!reading||reading.quality!=="Good"||reading.value===null||asset.monitoring.connectivity==="Unavailable";
        return {pointId:point.id,label:point.label,value:reading?.value??null,unit:point.unit,quality:reading?.quality??"Unavailable",timestamp:reading?.timestamp??snapshot.now,validity:unavailable?"Last known / unavailable" as const:stale?"Stale" as const:asset.monitoring.method==="Manual inspection"?"Recorded inspection" as const:"Current simulated" as const};
      }),alarms:snapshot.events.filter(event=>event.assetId===id&&event.active).map(({id,title,severity,timestamp})=>({id,title,severity,timestamp})),
      maintenance:snapshot.maintenance.filter(record=>record.assetId===id).map(({lastServiceDate,nextServiceDate,summary})=>({lastServiceDate,nextServiceDate,summary}))};
  });
  return structuredClone({simulatedAt:snapshot.now,capturedAt:actualAt,assets,issues:item.kind==="issues"?carriedIssues(template,snapshot,sessions):[]});
}
export const isGap = (asset:EvidenceAsset) => asset.condition==="Unknown"||asset.connectivity==="Unavailable"||asset.readings.some(reading=>reading.quality!=="Good"||reading.validity==="Stale");
export const isAbnormal = (asset:EvidenceAsset) => asset.condition==="Critical"||asset.condition==="Unknown"||asset.connectivity==="Unavailable"||asset.alarms.length>0||isGap(asset);
export function applicableAssets(item:TemplateItem,evidence:EvidenceSnapshot) { return item.kind==="gaps"?evidence.assets.filter(isGap):evidence.assets; }
export function evidenceChanges(saved:EvidenceSnapshot,current:EvidenceSnapshot,item:TemplateItem):string[] {
  const changes:string[]=[];
  for(const id of new Set([...saved.assets,...current.assets].map(asset=>asset.id))) {
    const before=saved.assets.find(asset=>asset.id===id),after=current.assets.find(asset=>asset.id===id);
    if(!before||!after){changes.push(`${id}: linked evidence availability changed.`);continue;}
    if(before.condition!==after.condition)changes.push(`${id}: condition ${before.condition} → ${after.condition}.`);
    if(before.connectivity!==after.connectivity||before.operatingState!==after.operatingState)changes.push(`${id}: connectivity or operating state changed.`);
    if(JSON.stringify(before.alarms.map(alarm=>`${alarm.id}:${alarm.severity}`).sort())!==JSON.stringify(after.alarms.map(alarm=>`${alarm.id}:${alarm.severity}`).sort()))changes.push(`${id}: active alarm set changed.`);
    for(const pointId of new Set([...before.readings,...after.readings].map(reading=>reading.pointId))) {
      const a=before.readings.find(reading=>reading.pointId===pointId),b=after.readings.find(reading=>reading.pointId===pointId);
      if(!a||!b||a.quality!==b.quality||a.validity!==b.validity){changes.push(`${id}: reading availability / quality changed (${pointId}).`);continue;}
      if(a.value===null||b.value===null ? a.value!==b.value : Math.abs(a.value-b.value)>(item.rules.tolerances[a.unit]??0))changes.push(`${id}: ${a.label} changed beyond the demonstration comparison tolerance.`);
    }
  }
  if(JSON.stringify(saved.issues.map(issue=>issue.key).sort())!==JSON.stringify(current.issues.map(issue=>issue.key).sort()))changes.push("The in-scope unresolved issue set changed.");
  return changes;
}
