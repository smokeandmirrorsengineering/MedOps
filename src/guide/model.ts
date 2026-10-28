import type { ReviewSession } from "../reviews/types";
import type { FollowUp, ActionClock } from "../followups/types";
import { FAULT_ASSET_ID } from "../simulation/types";
export interface GuideSession {
  id: string;
  startedAt: string;
  targetAssetId: string;
  baselineReviewIds: string[];
  baselineFollowUpIds: string[];
  detectedAt: string | null;
  assetViewedAt: string | null;
  viewedReportIds: string[];
}
export function createGuideSession(
  reviews: readonly ReviewSession[],
  followups: readonly FollowUp[],
  clock: ActionClock,
): GuideSession {
  return {
    id: `GUIDE-${clock.id()}`,
    startedAt: clock.now(),
    targetAssetId: FAULT_ASSET_ID,
    baselineReviewIds: reviews.map((review) => review.id),
    baselineFollowUpIds: followups.map((record) => record.id),
    detectedAt: null,
    assetViewedAt: null,
    viewedReportIds: [],
  };
}
export function guideProgress(
  session: GuideSession,
  reviews: readonly ReviewSession[],
  followups: readonly FollowUp[],
) {
  const newReviews = reviews.filter(
    (review) =>
      !session.baselineReviewIds.includes(review.id) &&
      review.template.scopeAssetIds.includes(session.targetAssetId),
  );
  const submitted = newReviews.filter(
    (review) => review.status === "Submitted",
  );
  const actions = followups.filter(
    (record) =>
      !session.baselineFollowUpIds.includes(record.id) &&
      record.assetId === session.targetAssetId &&
      submitted.some((review) => review.id === record.sourceReviewId),
  );
  const action =
    actions.find((record) => record.status === "Action Completed") ??
    actions[0];
  const review =
    newReviews.find((review) => review.id === action?.sourceReviewId) ??
    submitted[0] ??
    newReviews[0];
  const reVerification = action
    ? newReviews.find((review) => review.sourceFollowUpId === action.id)
    : undefined;
  const reportViewed =
    !!review &&
    session.viewedReportIds.includes(review.id) &&
    review.status === "Submitted";
  const done = [
    !!session.detectedAt,
    !!session.assetViewedAt,
    review?.status === "Submitted",
    action?.status === "Action Completed",
    reportViewed && !!reVerification,
  ];
  return {
    review,
    action,
    reVerification,
    reportViewed,
    done,
    completed: done.filter(Boolean).length,
  };
}
