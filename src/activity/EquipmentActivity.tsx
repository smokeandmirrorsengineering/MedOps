import { Link } from "react-router";
import { useDemoData } from "../state/DemoDataProvider";
import { useReviews } from "../reviews/ReviewProvider";
import { useFollowUps } from "../followups/FollowUpProvider";
import { recordTime } from "../reviews/ReviewComponents";
import { equipmentActivity } from "./model";
export function EquipmentActivity({ assetId }: { assetId: string }) {
  const { seedEvents, history } = useDemoData(),
    { sessions } = useReviews(),
    { records } = useFollowUps();
  const activity = equipmentActivity(
    assetId,
    seedEvents,
    history,
    sessions,
    records,
  );
  return (
    <section className="detail-section equipment-activity">
      <h3>Equipment Activity</h3>
      <p className="section-note">
        Recent records only. Simulated equipment dates and actual human-record
        dates are separate clocks.
      </p>
      {activity.slice(0, 8).map((event) => (
        <div key={event.id}>
          <span>{event.type}</span>
          <Link className="text-link" to={event.href}>
            {event.description}
          </Link>
          <small>
            {recordTime(event.timestamp)} · {event.clock}
          </small>
        </div>
      ))}
      {!activity.length && <p>No recorded activity for this equipment.</p>}
      {activity.length > 8 && (
        <small>
          Showing 8 of {activity.length} recorded entries. Open source records
          for more detail.
        </small>
      )}
    </section>
  );
}
