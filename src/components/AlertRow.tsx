import { ChevronRight, CircleAlert, Radio, TriangleAlert } from "lucide-react";
import type { DisplayAlert } from "../simulation/types";
import { useDemoData } from "../state/DemoDataProvider";
import { useAssetSelection } from "../state/useAssetSelection";
import { date, time } from "../lib/format";

export function AlertRow({event,expanded=false}:{event:Readonly<DisplayAlert>;expanded?:boolean}) {
  const {snapshot,getAsset,getAssetSimulation} = useDemoData();
  const {openAsset} = useAssetSelection();
  const asset = getAsset(event.assetId);
  const location = snapshot.locations.find(location=>location.id === asset?.locationId);
  const overdue = snapshot.maintenance.some(record=>record.assetId === event.assetId && record.nextServiceDate < snapshot.now.slice(0,10));
  const kind = event.kind ?? (asset?.monitoring.connectivity === "Unavailable" ? "Monitoring unavailable" : overdue ? "Maintenance requirement" : asset?.monitoring.method === "Manual inspection" ? "Inspection finding" : "Equipment condition");
  const Icon = event.severity === "Critical" ? TriangleAlert : event.severity === "Info" ? Radio : CircleAlert;
  const lastConfirmed = event.active && event.kind === "Equipment condition" && getAssetSimulation(event.assetId).lastConfirmedCritical;
  return <button className={`alert-row operational-alert ${expanded ? "expanded-alert" : ""}`} onClick={()=>openAsset(event.assetId)} aria-label={`${event.title} · ${event.assetId}`}>
    <span className={`status-badge ${event.severity === "Info" ? "unknown" : event.severity.toLowerCase()}`}><Icon size={14}/>{event.severity === "Info" ? "Information" : event.severity}</span>
    <span className="alert-copy">
      <span className="operational-alert-title"><b className="mono">{event.assetId}</b><strong>{event.title}</strong></span>
      <span className="alert-description">{event.description}</span>
      <span className="alert-location">{asset?.name ?? "Equipment unavailable"} · {location ? `${location.department} · ${location.room}` : "Location unavailable"} · {kind}</span>
      {lastConfirmed && <span className="confirmation-note">Last confirmed Critical · currently unverified</span>}
      {event.origin === "simulation" && <span className="simulation-tag">Simulated · #{event.sequence}{!event.active ? ` · resolved ${time(event.resolvedAt!)} BDT` : ""}</span>}
    </span>
    <span className="alert-time-state"><span>{date(event.timestamp)}</span><span>{time(event.timestamp)} BDT</span><b>{event.active ? "Active" : "Resolved"}</b></span><ChevronRight size={16}/>
  </button>;
}
