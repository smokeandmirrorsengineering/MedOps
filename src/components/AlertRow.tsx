import { ChevronRight, CircleAlert, Radio, TriangleAlert } from "lucide-react";
import type { AssetEvent } from "../domain/types";
import { useDemoData } from "../state/DemoDataProvider";
import { useAssetSelection } from "../state/useAssetSelection";
import { categoryMetadata } from "../lib/categories";
import { date, time } from "../lib/format";

export function AlertRow({
  event,
  expanded = false,
}: {
  event: Readonly<AssetEvent>;
  expanded?: boolean;
}) {
  const { snapshot, getAsset } = useDemoData();
  const { openAsset } = useAssetSelection();
  const asset = getAsset(event.assetId);
  const location = snapshot.locations.find(
    (item) => item.id === asset?.locationId,
  );
  const Icon =
    event.severity === "Critical"
      ? TriangleAlert
      : event.severity === "Info"
        ? Radio
        : CircleAlert;
  const overdue = snapshot.maintenance.some(
    (record) =>
      record.assetId === event.assetId &&
      record.nextServiceDate < snapshot.now.slice(0, 10),
  );
  const kind =
    asset?.monitoring.connectivity === "Unavailable"
      ? "Monitoring unavailable"
      : overdue
        ? "Maintenance requirement"
        : asset?.monitoring.method === "Manual inspection"
          ? "Inspection finding"
          : "Equipment condition";
  return (
    <button
      className={`alert-row ${expanded ? "expanded-alert" : ""}`}
      onClick={() => openAsset(event.assetId)}
      aria-label={`${event.title} · ${event.assetId}`}
    >
      <span className={`alert-icon ${event.severity.toLowerCase()}`}>
        <Icon size={16} />
      </span>
      <span className="alert-copy">
        <strong>{event.title}</strong>
        <span>
          <b className="mono">{event.assetId}</b>
          <i />
          {expanded ? `${date(event.timestamp)} · ` : ""}
          {time(event.timestamp)} BDT
        </span>
        {expanded && (
          <>
            <span className="alert-equipment">
              {asset?.name ?? "Equipment unavailable"}
            </span>
            <span className="alert-description">{event.description}</span>
            <span className="alert-location">
              {asset
                ? categoryMetadata[asset.category].label
                : "Unknown system"}{" "}
              ·{" "}
              {location
                ? `${location.building} · ${location.floor} · ${location.department} · ${location.room}`
                : "Location unavailable"}
            </span>
            <span className="alert-type">{kind}</span>
          </>
        )}
      </span>
      {expanded && (
        <span className="alert-state">
          <span
            className={`status-badge ${event.severity.toLowerCase() === "info" ? "unknown" : event.severity.toLowerCase()}`}
          >
            {event.severity === "Info" ? "Information" : event.severity}
          </span>
          <span className="active-event-label">
            {event.active ? "Active" : "Recorded"}
          </span>
        </span>
      )}
      <ChevronRight size={14} />
    </button>
  );
}
