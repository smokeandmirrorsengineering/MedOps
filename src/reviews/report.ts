import { followUpLabel, hasFollowUpText, responsibleLabel } from "./followUp";
import type { ReviewException, ReviewSession } from "./types";

export function presentException(
  exception: ReviewException,
  review: ReviewSession,
) {
  const asset = review.responses[exception.itemId]?.evidence.assets.find(
    (asset) => asset.id === exception.assetId,
  );
  return {
    ...exception,
    itemOrder: review.template.items.find(
      (item) => item.id === exception.itemId,
    )?.order,
    asset: exception.assetId ?? "Scope-level finding",
    responsible: responsibleLabel(exception.responsible),
    followUp: followUpLabel(exception.followUp),
    missingFollowUp:
      !hasFollowUpText(exception.responsible) ||
      !hasFollowUpText(exception.followUp),
    // Describe recorded abnormal evidence without evaluating live equipment or limits.
    evidenceContext: asset
      ? [
          asset.condition + " at capture",
          ...asset.alarms.map((alarm) => alarm.title),
        ].join(" · ")
      : "",
  };
}

/** A presentation projection of a submitted record. Never saves or recalculates it. */
export function buildReviewSummary(review: ReviewSession) {
  if (review.status !== "Submitted")
    throw new Error("A summary requires a submitted review.");
  const findings = review.exceptions.map((exception) =>
    presentException(exception, review),
  );
  const items = review.template.items.map((item) => ({
    id: item.id,
    order: item.order,
    title: item.title,
    response: review.responses[item.id]?.choice || "Not recorded",
    findings: findings.filter((finding) => finding.itemId === item.id),
  }));
  return {
    reviewId: review.id,
    status: review.status,
    reviewedCount: items.filter((item) => item.response !== "Not recorded")
      .length,
    exceptionCount: findings.length,
    missingFollowUpCount: findings.filter((finding) => finding.missingFollowUp)
      .length,
    allHumanPass:
      items.length > 0 && items.every((item) => item.response === "Pass"),
    items,
    findings,
    observations: review.summary,
    openingNotes: review.openingNotes,
    simulatedTimes: [
      ...new Set(
        Object.values(review.responses).map(
          (response) => response.evidence.simulatedAt,
        ),
      ),
    ],
  };
}
