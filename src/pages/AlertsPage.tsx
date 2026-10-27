import { Radio, ShieldCheck } from "lucide-react";
import { useDemoData } from "../state/DemoDataProvider";
import { AlertRow } from "../components/AlertRow";
import { PageHeading } from "../components/PageHeading";
import { orderedHistory } from "../simulation/model";
import { useAssetSelection } from "../state/useAssetSelection";
import { time } from "../lib/format";

export function AlertsPage() {
  const { activeEvents, allAlerts, history } = useDemoData();
  const { openAsset } = useAssetSelection();
  const resolved = allAlerts.filter((event) => !event.active);
  return (
    <>
      <PageHeading
        page="Alerts"
        title="Engineering alerts"
        description="Review equipment conditions, service needs and monitoring gaps."
      />
      <section className="panel full-alerts">
        <div className="inventory-heading">
          <div>
            <h2>
              Active synthetic events{" "}
              <span className="inventory-count">{activeEvents.length}</span>
            </h2>
            <p>Ordered by severity, timestamp and event sequence.</p>
          </div>
          <span className="read-only-label">
            <ShieldCheck size={14} />
            Read-only events
          </span>
        </div>
        <div className="alert-page-note">
          <Radio size={16} />
          <p>
            Equipment conditions, maintenance requirements and unavailable
            monitoring are shown separately. A data gap does not confirm an
            equipment fault.
          </p>
        </div>
        <div className="alert-list" aria-label="Active alerts">
          {activeEvents.map((event) => (
            <AlertRow key={event.id} event={event} expanded />
          ))}
        </div>
      </section>
      <section className="panel full-alerts simulation-history-panel">
        <div className="inventory-heading">
          <div>
            <h2>
              Resolved simulated alerts{" "}
              <span className="inventory-count">{resolved.length}</span>
            </h2>
            <p>
              Closed scenario alarms remain available for review until Reset
              Demo.
            </p>
          </div>
        </div>
        <div className="alert-list" aria-label="Resolved alerts">
          {resolved.map((event) => (
            <AlertRow key={event.id} event={event} expanded />
          ))}
          {!resolved.length && (
            <p className="history-empty">
              No simulated alerts have been resolved.
            </p>
          )}
        </div>
      </section>
      <section className="panel simulation-history-panel">
        <div className="inventory-heading">
          <div>
            <h2>
              Simulation event history{" "}
              <span className="inventory-count">{history.length}</span>
            </h2>
            <p>
              Recorded transitions, newest sequence first. These logs do not
              determine equipment condition.
            </p>
          </div>
        </div>
        <div
          className="simulation-history"
          aria-label="Simulation event history"
        >
          {orderedHistory(history).map((event) => (
            <button
              key={event.id}
              className="history-row"
              onClick={() => openAsset(event.assetId)}
            >
              <span
                className={`legend-dot ${event.severity === "Critical" ? "critical" : "unknown"}`}
              />
              <span>
                <strong>{event.title}</strong>
                <small>
                  {event.assetId} · {time(event.timestamp)} BDT · #
                  {event.sequence} · Recorded
                </small>
                <span>{event.description}</span>
              </span>
            </button>
          ))}
          {!history.length && (
            <p className="history-empty">
              No simulation changes yet. Try Demo Controls on the Dashboard.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
