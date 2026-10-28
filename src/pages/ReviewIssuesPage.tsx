import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useReviews } from "../reviews/ReviewProvider";
import { openReviewIssues } from "../reviews/evidence";
import {
  ReviewHeader,
  ReviewNav,
  ReviewStorageNotice,
  recordTime,
} from "../reviews/ReviewComponents";
export function ReviewIssuesPage() {
  const { sessions } = useReviews();
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
            <Link className="text-link" to={`/reviews/${review.id}/report`}>
              View submitted report · {review.id}
            </Link>
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
