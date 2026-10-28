import { Link } from "react-router";
import { ArrowRight, ClipboardCheck, Plus } from "lucide-react";
import { useReviews } from "../reviews/ReviewProvider";
import { otTemplate } from "../reviews/template";
import { openReviewIssues } from "../reviews/evidence";
import {
  ReviewHeader,
  ReviewNav,
  ReviewStorageNotice,
  recordTime,
} from "../reviews/ReviewComponents";
export function ReviewsHomePage() {
  const { sessions } = useReviews();
  return (
    <>
      <ReviewHeader
        title="Engineering Reviews"
        description="System evidence, human verification and documented engineering follow-up."
      />
      <ReviewNav />
      <ReviewStorageNotice />
      <section className="panel review-intro">
        <div className="review-intro-icon">
          <ClipboardCheck size={26} />
        </div>
        <div>
          <span className="small-caps">
            ONE DEMONSTRATION TEMPLATE · VERSION {otTemplate.version}
          </span>
          <h2>{otTemplate.title}</h2>
          <p>{otTemplate.scope}</p>
          <p>{otTemplate.disclaimer}</p>
        </div>
        <Link className="review-primary" to="/reviews/new">
          <Plus size={16} />
          Start New Review
        </Link>
      </section>
      <Link className="review-issues-shortcut" to="/reviews/issues">
        <span>
          {openReviewIssues(sessions).length} open issues from submitted reviews
        </span>
        <ArrowRight size={16} />
      </Link>
      {(["Draft", "Submitted"] as const).map((status) => (
        <section key={status} className="panel review-list-panel">
          <div className="inventory-heading">
            <h2>
              {status === "Draft" ? "Saved drafts" : "Submitted review history"}
              <span className="inventory-count">
                {sessions.filter((review) => review.status === status).length}
              </span>
            </h2>
          </div>
          {sessions
            .filter((review) => review.status === status)
            .map((review) => (
              <Link
                key={review.id}
                className="review-session-row"
                to={`/reviews/${review.id}/${status === "Draft" ? "run" : "report"}`}
              >
                <span>
                  <strong>{review.template.title}</strong>
                  <small className="mono">{review.id}</small>
                  <small>{review.scope}</small>
                </span>
                <span>
                  <strong>{review.status}</strong>
                  <small>
                    {review.technician} · {review.role}
                  </small>
                  <small>Created {recordTime(review.createdAt)}</small>
                  {review.submittedAt && (
                    <small>Submitted {recordTime(review.submittedAt)}</small>
                  )}
                  <small>
                    {Object.keys(review.responses).length}/9 responses ·{" "}
                    {review.exceptions.length} open issues
                  </small>
                </span>
                <ArrowRight size={16} />
              </Link>
            ))}
          {!sessions.some((review) => review.status === status) && (
            <p className="review-empty">
              {status === "Draft"
                ? "No saved drafts. Start a review to record your observations."
                : "No submissions yet. Submitted reports retain the evidence recorded at inspection time."}
            </p>
          )}
        </section>
      ))}
    </>
  );
}
