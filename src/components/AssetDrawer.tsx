import { useEffect, useRef } from "react";
import {
  Activity,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Radio,
  Wrench,
  X,
} from "lucide-react";
import type { Asset, Evaluation, Snapshot } from "../domain/types";
import { latestReading } from "../domain/evaluateAsset";
import { date, time } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

export function AssetDrawer({
  asset,
  snapshot,
  onClose,
}: {
  asset: Asset & Evaluation;
  snapshot: Snapshot;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const closeAction = useRef(onClose);
  useEffect(() => {
    closeAction.current = onClose;
  }, [onClose]);
  const location = snapshot.locations.find((l) => l.id === asset.locationId)!;
  const maintenance = snapshot.maintenance.filter(
    (m) => m.assetId === asset.id,
  );
  const events = snapshot.events
    .filter((e) => e.assetId === asset.id)
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeAction.current();
      if (event.key === "Tab") {
        const controls = panel.current?.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, [tabindex="0"]',
        );
        if (!controls?.length) return;
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = scroll;
      document.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, []);

  return (
    <div className="drawer-layer" onClick={onClose}>
      <div
        ref={panel}
        className="asset-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-header">
          <span className="eyebrow">
            ASSET DETAILS <ChevronRight size={13} /> <span>{asset.id}</span>
          </span>
          <button
            ref={close}
            className="icon-button"
            onClick={onClose}
            aria-label="Close asset details"
          >
            <X size={20} />
          </button>
        </header>
        <div className="drawer-body">
          <div className="drawer-identity">
            <span className="asset-large-icon">
              <Activity size={26} />
            </span>
            <div>
              <span className="mono asset-id">{asset.id}</span>
              <h2 id="asset-title">{asset.name}</h2>
              <p>{asset.category}</p>
            </div>
          </div>
          <div className="drawer-meta">
            <StatusBadge condition={asset.condition} />
            <span className="operating">
              <span
                className={
                  asset.operatingState === "Running"
                    ? "running-dot"
                    : "muted-dot"
                }
              />
              {asset.operatingState}
            </span>
          </div>
          <section
            className={`condition-panel ${asset.condition.toLowerCase()}`}
          >
            <h3>Condition assessment</h3>
            <ul>
              {asset.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <p>Evaluated at {time(snapshot.now)} BDT · Fictional demo rules</p>
          </section>
          <section className="detail-section">
            <h3>
              <MapPin size={16} />
              Equipment & location
            </h3>
            <dl className="detail-grid">
              <div>
                <dt>Building</dt>
                <dd>{location.building}</dd>
              </div>
              <div>
                <dt>Floor</dt>
                <dd>{location.floor}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{location.department}</dd>
              </div>
              <div>
                <dt>Room</dt>
                <dd>{location.room}</dd>
              </div>
              <div>
                <dt>Manufacturer (fictional)</dt>
                <dd>{asset.manufacturer}</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>{asset.model}</dd>
              </div>
            </dl>
          </section>
          <section className="detail-section">
            <h3>
              <Activity size={16} />
              Readings <span className="section-tag">SIMULATED</span>
            </h3>
            <div className="reading-grid">
              {snapshot.points
                .filter((p) => p.assetId === asset.id)
                .map((point) => {
                  const reading = latestReading(
                    snapshot.readings,
                    asset.id,
                    point.id,
                  );
                  return (
                    <div className="reading-card" key={point.id}>
                      <span>{point.label}</span>
                      <strong>
                        {reading?.value ?? "—"} <small>{point.unit}</small>
                      </strong>
                      <span
                        className={`quality ${reading?.quality === "Good" ? "good" : ""}`}
                      >
                        {reading?.quality ?? "Missing"} quality
                      </span>
                      <span className="reading-time">
                        {reading
                          ? `${time(reading.timestamp)} BDT`
                          : "No report"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </section>
          <section className="detail-section">
            <h3>
              <Radio size={16} />
              Monitoring information
            </h3>
            <dl className="detail-grid">
              <div>
                <dt>Data method</dt>
                <dd>{asset.monitoring.method}</dd>
              </div>
              <div>
                <dt>Connectivity</dt>
                <dd>{asset.monitoring.connectivity}</dd>
              </div>
              <div className="full-width">
                <dt>Source</dt>
                <dd>{asset.monitoring.source}</dd>
              </div>
              <div>
                <dt>Last reported</dt>
                <dd>
                  {asset.lastReported
                    ? `${date(asset.lastReported)}, ${time(asset.lastReported)} BDT`
                    : "No report available"}
                </dd>
              </div>
              <div>
                <dt>Expected reporting window</dt>
                <dd>{asset.monitoring.expectedIntervalMinutes} minutes</dd>
              </div>
            </dl>
          </section>
          <section className="detail-section">
            <h3>
              <Wrench size={16} />
              Maintenance
            </h3>
            {maintenance.map((record) => (
              <div className="maintenance-record" key={record.id}>
                <div>
                  <span>Last service · {date(record.lastServiceDate)}</span>
                  <span
                    className={
                      record.nextServiceDate < snapshot.now.slice(0, 10)
                        ? "overdue"
                        : ""
                    }
                  >
                    Next service · {date(record.nextServiceDate)}
                  </span>
                </div>
                <p>{record.summary}</p>
                <small>{record.technician}</small>
              </div>
            ))}
          </section>
          <section className="detail-section">
            <h3>
              <FileText size={16} />
              Engineering documents
            </h3>
            <p className="section-note">
              Sample references only. Files will be added in a later milestone.
            </p>
            {snapshot.documents
              .filter((d) => d.assetId === asset.id)
              .map((doc) => (
                <div className="document-row" key={doc.id}>
                  <FileText size={19} />
                  <div>
                    <strong>{doc.title}</strong>
                    <span>
                      {doc.kind} · Rev {doc.revision}
                    </span>
                  </div>
                  <span className="placeholder-label">Placeholder</span>
                </div>
              ))}
          </section>
          <section className="detail-section">
            <h3>
              <Clock3 size={16} />
              Recent events
            </h3>
            <div className="event-timeline">
              {events.map((event) => (
                <div key={event.id}>
                  <span
                    className={`timeline-dot ${event.severity.toLowerCase()}`}
                  />
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                  <small>
                    {date(event.timestamp)} · {time(event.timestamp)} BDT ·{" "}
                    {event.active ? "Open" : "Recorded"}
                  </small>
                </div>
              ))}
            </div>
          </section>
          <p className="drawer-disclaimer">
            Synthetic equipment, readings and service records. For product
            demonstration only.
          </p>
        </div>
      </div>
    </div>
  );
}
