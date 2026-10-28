import { Link } from "react-router";
import { useFollowUps } from "./FollowUpProvider";
import { useFollowUpSelection } from "./useFollowUpSelection";
import { COMPLETION_LABEL } from "./types";
export function CurrentFollowUps({ reviewId }: { reviewId: string }) {
  const { records } = useFollowUps(),
    selection = useFollowUpSelection();
  const related = records.filter(
    (record) => record.sourceReviewId === reviewId,
  );
  return (
    <section className="panel current-followups no-print">
      <h2>Current follow-up actions</h2>
      <p>
        Operational updates linked to this review. This panel is outside the
        immutable inspection record and is excluded from both print formats.
      </p>
      {related.map((record) => (
        <div key={record.id}>
          <span>
            <b>
              {record.assetId ?? "Scope finding"} · {record.status}
            </b>
            <small>
              {record.status === "Action Completed"
                ? COMPLETION_LABEL
                : record.proposedAction}
            </small>
          </span>
          <button
            className="review-secondary"
            onClick={() =>
              selection.open(record.sourceReviewId, record.sourceExceptionId)
            }
          >
            Open Follow-Up
          </button>
        </div>
      ))}
      {!related.length && (
        <p>No follow-up actions have been created for this review.</p>
      )}
      <Link
        className="text-link"
        to={`/reviews/issues?review=${encodeURIComponent(reviewId)}`}
      >
        Open original issues and follow-up actions
      </Link>
    </section>
  );
}
