import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useReviews } from "../reviews/ReviewProvider";
import { openReviewIssues } from "../reviews/evidence";
import { useFollowUps } from "../followups/FollowUpProvider";
import { useFollowUpSelection } from "../followups/useFollowUpSelection";
import { COMPLETION_LABEL } from "../followups/types";
import { ReviewServiceLinks } from "../service/ServiceIntegration";
import {
  ReviewHeader,
  ReviewNav,
  ReviewStorageNotice,
  recordTime,
} from "../reviews/ReviewComponents";
export function ReviewIssuesPage() {
  const { sessions } = useReviews();
  const followups = useFollowUps(),
    selection = useFollowUpSelection();
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const issues = openReviewIssues(sessions).filter(
    ({ review, exception }) =>
      (!params.get("review") || review.id === params.get("review")) &&
      `${review.id} ${exception.assetId} ${exception.observation} ${exception.responsible}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <ReviewHeader
        title="Open Engineering Issues"
        description="Unresolved exceptions from submitted reviews. Equipment simulation changes do not close these records."
      />
      <ReviewNav />
      <ReviewStorageNotice />
      {followups.status !== "saved" && (
        <p className="followup-storage" role="status">
          {followups.status === "unavailable"
            ? "Follow-up storage is unavailable or full. Changes are in memory only."
            : "Invalid saved follow-up data could not be restored. Original reviews and equipment were not changed."}
        </p>
      )}
      <section className="panel review-issues-panel">
        <div className="inventory-heading">
          <h2>{issues.length} open issues</h2>
          <input
            aria-label="Search open issues"
            placeholder="Search asset, observation or responsible role…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {issues.map(({ review, exception }) => (
          <div className="review-issue" key={exception.id}>
            <div>
              <strong>{exception.itemTitle}</strong>
              <span className="status-badge attention">Open</span>
            </div>
            <p>
              {exception.assetId ?? "Scope-level issue"}{" "}
              {exception.assetName ?? ""} · {exception.issueType}
            </p>
            <p>
              <b>Observation:</b> {exception.observation}
            </p>
            <p>
              <b>Responsible:</b> {exception.responsible}
            </p>
            <p>
              <b>Suggested next action:</b> {exception.followUp}
            </p>
            <div className="issue-followup">
              <button
                className="review-secondary"
                onClick={() => selection.open(review.id, exception.id)}
              >
                {followups.records.some(
                  (record) =>
                    record.sourceReviewId === review.id &&
                    record.sourceExceptionId === exception.id,
                )
                  ? "Open Follow-Up"
                  : "Create Follow-Up"}
              </button>
              {followups.records
                .filter(
                  (record) =>
                    record.sourceReviewId === review.id &&
                    record.sourceExceptionId === exception.id,
                )
                .map((record) => (
                  <span key={record.id}>
                    Action: {record.status}
                    {record.status === "Action Completed" && (
                      <small>{COMPLETION_LABEL}</small>
                    )}
                  </span>
                ))}
            </div>
            <Link className="text-link" to={`/reviews/${review.id}/report`}>
              View submitted report · {review.id}
            </Link>
            {exception.assetId && <ReviewServiceLinks assetId={exception.assetId} reviewId={review.id} exceptionId={exception.id}/>}
            <small>
              Actual review submission: {recordTime(review.submittedAt!)}
            </small>
          </div>
        ))}
        {!issues.length && (
          <p className="review-empty">
            No matching submitted-review exceptions. Draft exceptions remain
            within their draft and do not appear as submitted issues.
          </p>
        )}
      </section>
    </>
  );
}
