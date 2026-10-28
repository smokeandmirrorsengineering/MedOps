import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { Activity, Printer } from "lucide-react";
import { useReviews } from "../reviews/ReviewProvider";
import { AUTHORIZATION_STATEMENT } from "../reviews/types";
import type { HumanVerification } from "../reviews/types";
import {
  EvidenceView,
  ReviewMissing,
  ReviewStorageNotice,
  recordTime,
} from "../reviews/ReviewComponents";
function VerificationRecord({ value }: { value: HumanVerification }) {
  return (
    <dl className="report-human-record">
      <div>
        <dt>Human response</dt>
        <dd>{value.choice}</dd>
      </div>
      <div>
        <dt>Verification method</dt>
        <dd>{value.method || "Not provided / not required"}</dd>
      </div>
      <div>
        <dt>Human observations</dt>
        <dd>{value.observation || "—"}</dd>
      </div>
      <div>
        <dt>Supporting notes</dt>
        <dd>{value.notes || "—"}</dd>
      </div>
      <div>
        <dt>Reconciliation note</dt>
        <dd>{value.reconciliation || "—"}</dd>
      </div>
      <div>
        <dt>Responsible role/person</dt>
        <dd>{value.responsible || "—"}</dd>
      </div>
      <div>
        <dt>Suggested follow-up</dt>
        <dd>{value.followUp || "—"}</dd>
      </div>
    </dl>
  );
}
export function ReviewReportPage() {
  const { reviewId } = useParams(),
    { sessions } = useReviews();
  const review = sessions.find((review) => review.id === reviewId);
  useEffect(() => {
    document.body.classList.add("review-report-view");
    return () => document.body.classList.remove("review-report-view");
  }, []);
  if (!review) return <ReviewMissing />;
  if (review.status !== "Submitted")
    return (
      <section className="panel empty-state">
        <h1>This review is a draft</h1>
        <Link to={`/reviews/${review.id}/run`}>Resume review</Link>
      </section>
    );
  return (
    <>
      <div className="review-actions no-print">
        <Link to="/reviews" className="text-link">
          ← Review history
        </Link>
        <Link to="/reviews/issues" className="text-link">
          Open Issues
        </Link>
        <button className="review-primary" onClick={() => window.print()}>
          <Printer size={15} />
          Print Report
        </button>
      </div>
      <ReviewStorageNotice />
      <article className="panel review-report">
        <div className="review-print-banner">
          MedOps · SIMULATED DATA · Engineering inspection record · {review.id}
        </div>
        <header className="review-report-heading">
          <div className="review-report-brand">
            <Activity size={23} />
            MedOps
          </div>
          <span className="review-synthetic-label">SIMULATED DATA</span>
          <h1>{review.template.title}</h1>
          <p className="review-report-status">
            Submitted · {Object.keys(review.responses).length} recorded
            responses · {review.exceptions.length} open issues
          </p>
          <dl className="review-report-meta">
            <div>
              <dt>Review ID</dt>
              <dd className="mono">{review.id}</dd>
            </div>
            <div>
              <dt>Template version</dt>
              <dd>
                {review.template.version} · {review.template.id}
              </dd>
            </div>
            <div>
              <dt>Fictional review location</dt>
              <dd>{review.scope}</dd>
            </div>
            <div>
              <dt>Typed technician / role (unverified)</dt>
              <dd>
                {review.technician} · {review.role}
              </dd>
            </div>
            <div>
              <dt>Actual record creation</dt>
              <dd>{recordTime(review.createdAt)}</dd>
            </div>
            <div>
              <dt>Actual submission</dt>
              <dd>{recordTime(review.submittedAt!)}</dd>
            </div>
          </dl>
          <p className="review-caution">{review.template.disclaimer}</p>
          <p className="review-authorization">{AUTHORIZATION_STATEMENT}</p>
          <p className="review-small-note">
            Historical record: all evidence and wording below were frozen on
            submission. Current equipment conditions are not used to recalculate
            this report.
          </p>
          {review.openingNotes && (
            <p className="report-summary">
              <strong>Opening notes:</strong> {review.openingNotes}
            </p>
          )}
          {review.summary && (
            <p className="report-summary">
              <strong>Summary observations:</strong> {review.summary}
            </p>
          )}
        </header>
        {review.template.items.map((item) => {
          const response = review.responses[item.id];
          return (
            <section key={item.id} className="review-report-item">
              <header>
                <span className="small-caps">
                  {item.section} · ITEM {item.order}
                </span>
                <h2>{item.title}</h2>
                <p>{item.prompt}</p>
                <p className="review-small-note">{item.limitation}</p>
              </header>
              <h3>
                Human verification — actual save {recordTime(response.savedAt)}
              </h3>
              <VerificationRecord value={response} />
              {response.gaps.map((gap) => (
                <section key={gap.assetId} className="report-gap">
                  <h4>{gap.assetId} — individual gap verification</h4>
                  <VerificationRecord value={gap} />
                </section>
              ))}
              {response.acknowledgedIssues.length > 0 && (
                <div className="report-acknowledged">
                  <strong>
                    Issues acknowledged as reviewed (remain unresolved)
                  </strong>
                  {[
                    ...new Map(
                      [
                        ...response.evidence.issues,
                        ...(response.changeAcknowledgement?.evidence.issues ??
                          []),
                      ].map((issue) => [issue.key, issue]),
                    ).values(),
                  ]
                    .filter((issue) =>
                      response.acknowledgedIssues.includes(issue.key),
                    )
                    .map((issue) => (
                      <p key={issue.key}>
                        {issue.title} · {issue.assetId ?? "Scope issue"}
                      </p>
                    ))}
                </div>
              )}
              <h3>Captured system evidence — historical, synthetic</h3>
              <EvidenceView evidence={response.evidence} interactive={false} />
              {response.changeAcknowledgement && (
                <div className="review-change-banner">
                  <strong>Evidence discrepancy explicitly recorded</strong>
                  <p>{response.changeAcknowledgement.note}</p>
                  <p>
                    Actual acknowledgement:{" "}
                    {recordTime(response.changeAcknowledgement.notedAt)}
                  </p>
                  <ul>
                    {response.changeAcknowledgement.changes.map((change) => (
                      <li key={change}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
        <section className="review-report-exceptions">
          <h2>Unresolved exceptions & follow-up</h2>
          {review.exceptions.map((exception) => (
            <div key={exception.id} className="report-exception">
              <strong>
                {exception.itemTitle} · {exception.issueType} · Open
              </strong>
              <p>
                {exception.assetId ?? "Scope-level observation"}
                {exception.assetName ? ` · ${exception.assetName}` : ""}
              </p>
              <p>
                <b>Observation:</b> {exception.observation}
              </p>
              <p>
                <b>Responsible:</b> {exception.responsible}
              </p>
              <p>
                <b>Suggested follow-up:</b> {exception.followUp}
              </p>
            </div>
          ))}
          {!review.exceptions.length && (
            <p>
              No exceptions were recorded. This is not a determination of
              equipment safety.
            </p>
          )}
        </section>
        <footer className="review-report-footer">
          <strong>
            SIMULATED DATA · Unverified typed identity · No authenticated
            signature
          </strong>
          <p>{AUTHORIZATION_STATEMENT}</p>
        </footer>
      </article>
    </>
  );
}
