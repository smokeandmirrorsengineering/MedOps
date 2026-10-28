import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Activity, Printer } from "lucide-react";
import { useReviews } from "../reviews/ReviewProvider";
import { AUTHORIZATION_STATEMENT } from "../reviews/types";
import type { HumanVerification } from "../reviews/types";
import { ReviewSummary } from "../reviews/ReviewSummary";
import { ReportEvidence } from "../reviews/ReportEvidence";
import { followUpLabel, responsibleLabel } from "../reviews/followUp";
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
        <dd>{responsibleLabel(value.responsible)}</dd>
      </div>
      <div>
        <dt>Suggested follow-up</dt>
        <dd>{followUpLabel(value.followUp)}</dd>
      </div>
    </dl>
  );
}
export function ReviewReportPage() {
  const [screenMode, setScreenMode] = useState<"summary" | "detailed">(
    "summary",
  );
  const { reviewId } = useParams(),
    { sessions } = useReviews();
  const review = sessions.find((review) => review.id === reviewId);
  useEffect(() => {
    document.body.classList.add("review-report-view");
    document.body.dataset.reviewPrint = "summary";
    const resetPrintMode = () => {
      document.body.dataset.reviewPrint = "summary";
    };
    window.addEventListener("afterprint", resetPrintMode);
    return () => {
      window.removeEventListener("afterprint", resetPrintMode);
      document.body.classList.remove("review-report-view");
      delete document.body.dataset.reviewPrint;
    };
  }, [reviewId]);
  function print(mode: "summary" | "detailed") {
    // Both immutable views are already rendered. Select print CSS synchronously
    // so window.print never races a React state update or clones a new record.
    document.body.dataset.reviewPrint = mode;
    window.print();
  }
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
        <button className="review-primary" onClick={() => print("summary")}>
          <Printer size={15} />
          Print Summary
        </button>
        <button className="review-secondary" onClick={() => print("detailed")}>
          <Printer size={15} />
          Print Detailed Record
        </button>
      </div>
      <ReviewStorageNotice />
      <div
        className="report-view-switch no-print"
        role="group"
        aria-label="Report view"
      >
        <button
          aria-pressed={screenMode === "summary"}
          onClick={() => setScreenMode("summary")}
        >
          Executive summary
        </button>
        <button
          aria-pressed={screenMode === "detailed"}
          onClick={() => setScreenMode("detailed")}
        >
          Detailed record
        </button>
        <span>
          Both formats use this submitted record. Printing defaults to Summary.
        </span>
      </div>
      <div className="report-formats" data-screen-mode={screenMode}>
        <div className="report-summary-format">
          <ReviewSummary review={review} />
        </div>
        <article className="panel review-report report-detailed-format">
          <div className="review-print-banner">
            MedOps · SIMULATED DATA · Engineering inspection record ·{" "}
            {review.id}
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
              submission. Current equipment conditions are not used to
              recalculate this report.
            </p>
            {review.openingNotes && (
              <p className="report-summary">
                <strong>Opening notes:</strong> {review.openingNotes}
              </p>
            )}
            {review.summary && (
              <p className="report-summary">
                <strong>
                  Technician-entered summary observations (verbatim):
                </strong>{" "}
                {review.summary}
                <small className="report-note-context">
                  These notes do not establish an overall clearance or resolve
                  recorded exceptions.
                </small>
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
                  Human verification — actual save{" "}
                  {recordTime(response.savedAt)}
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
                <div className="report-screen-evidence">
                  <EvidenceView
                    evidence={response.evidence}
                    interactive={false}
                  />
                </div>
                <div className="report-print-evidence">
                  <ReportEvidence evidence={response.evidence} />
                </div>
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
                    <div className="report-print-evidence">
                      <h4>Evidence at discrepancy acknowledgement</h4>
                      <ReportEvidence
                        evidence={response.changeAcknowledgement.evidence}
                      />
                    </div>
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
                  <b>Responsible:</b> {responsibleLabel(exception.responsible)}
                </p>
                <p>
                  <b>Suggested follow-up:</b>{" "}
                  {followUpLabel(exception.followUp)}
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
      </div>
    </>
  );
}
