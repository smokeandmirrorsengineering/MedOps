import type { AssetEvent } from "../domain/types";
import type { SimulationEvent } from "../simulation/types";
import type { ReviewSession } from "../reviews/types";
import type { FollowUp } from "../followups/types";
export interface EquipmentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  clock: "Simulated equipment time" | "Actual record time";
  href: string;
  order: number;
}
export function equipmentActivity(
  assetId: string,
  seedEvents: readonly AssetEvent[],
  history: readonly SimulationEvent[],
  reviews: readonly ReviewSession[],
  followups: readonly FollowUp[],
): EquipmentActivity[] {
  const events: EquipmentActivity[] = [
    ...seedEvents
      .filter((event) => event.assetId === assetId)
      .map((event) => ({
        id: `seed:${event.id}`,
        type: event.active
          ? "Synthetic alarm / finding"
          : "Recorded synthetic event",
        description: event.title,
        timestamp: event.timestamp,
        clock: "Simulated equipment time" as const,
        href: "/alerts",
        order: 0,
      })),
    ...history
      .filter((event) => event.assetId === assetId)
      .map((event) => ({
        id: `simulation:${event.id}`,
        type: "Simulation transition",
        description: event.title,
        timestamp: event.timestamp,
        clock: "Simulated equipment time" as const,
        href: "/alerts",
        order: event.sequence,
      })),
    ...reviews
      .filter(
        (review) =>
          review.status === "Submitted" &&
          (review.subjectAssetId === assetId ||
            Object.values(review.responses).some((response) =>
              response.evidence.assets.some((asset) => asset.id === assetId),
            )),
      )
      .map((review) => ({
        id: `review:${review.id}`,
        type: "Submitted engineering review",
        description: `${review.template.title} · ${review.exceptions.length} recorded open exception(s)`,
        timestamp: review.submittedAt!,
        clock: "Actual record time" as const,
        href: `/reviews/${review.id}/report`,
        order: 0,
      })),
    ...followups
      .filter((record) => record.assetId === assetId)
      .flatMap((record) =>
        record.history.map((event, index) => ({
          id: `followup:${record.id}:${event.id}`,
          type: "Follow-up action",
          description: event.from
            ? `${event.from} → ${event.to}`
            : "Follow-up created · Open",
          timestamp: event.at,
          clock: "Actual record time" as const,
          href: `/reviews/issues?followup=${encodeURIComponent(record.id)}`,
          order: index,
        })),
      ),
  ];
  return [...new Map(events.map((event) => [event.id, event])).values()].sort(
    (a, b) =>
      Date.parse(b.timestamp) - Date.parse(a.timestamp) ||
      b.order - a.order ||
      a.id.localeCompare(b.id),
  );
}
