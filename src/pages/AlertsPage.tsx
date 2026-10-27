import { Radio, ShieldCheck } from "lucide-react";
import { useDemoData } from "../state/DemoDataProvider";
import { AlertRow } from "../components/AlertRow";
import { PageHeading } from "../components/PageHeading";

export function AlertsPage() {
  const { activeEvents } = useDemoData();
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
            <p>Ordered by severity, then most recent timestamp.</p>
          </div>
          <span className="read-only-label">
            <ShieldCheck size={14} />
            Read-only demo
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
    </>
  );
}
