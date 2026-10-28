import { BrandMark } from "../components/BrandMark";
import { recordTime } from "./ReviewComponents";
import { buildReviewSummary } from "./report";
import { AUTHORIZATION_STATEMENT, type ReviewSession } from "./types";

export function ReviewSummary({ review }: { review: ReviewSession }) {
  const summary = buildReviewSummary(review);
  return (
    <article
      className="panel review-executive-summary"
      aria-label="Engineering Review Summary"
    >
      <div className="review-print-banner">
        Evidanor · SIMULATED DATA · Engineering Review Summary · {review.id}
      </div>
      <header className="executive-brand-bar">
        <div className="executive-brand">
          <BrandMark size={32} />
          <strong>Evidanor</strong>
        </div>
        <div>
          <strong>ENGINEERING REVIEW SUMMARY</strong>
          <span>SIMULATED DATA · FROZEN RECORD</span>
        </div>
      </header>
      <div className="executive-content">
        <header className="executive-title">
          <h1>{review.template.title}</h1>
          <p>MedOps Demo Hospital (fictional) · {review.scope}</p>
          <p className="executive-identity">
            {review.id} · Template v{review.template.version}
          </p>
        </header>
        <dl className="executive-metadata">
          <div>
            <dt>Actual inspection record created</dt>
            <dd>{recordTime(review.createdAt)}</dd>
          </div>
          <div>
            <dt>Actual submission</dt>
            <dd>{recordTime(review.submittedAt!)}</dd>
          </div>
          <div className="executive-technician">
            <dt>Technician / role — unverified typed information</dt>
            <dd>
              {review.technician} · {review.role}
            </dd>
          </div>
        </dl>
        <div className="executive-indicators">
          <div>
            <span>RECORD STATE</span>
            <strong>Submitted</strong>
            <small>Inspection record completed</small>
          </div>
          <div>
            <span>ITEMS REVIEWED</span>
            <strong>{summary.reviewedCount}</strong>
            <small>Human responses recorded</small>
          </div>
          <div className="executive-open-count">
            <span>OPEN EXCEPTIONS</span>
            <strong>{summary.exceptionCount}</strong>
            <small>Unresolved recorded findings</small>
          </div>
        </div>
        <section className="executive-interpretation">
          <h2>Recorded findings</h2>
          <p>
            {summary.exceptionCount
              ? `${summary.exceptionCount} unresolved exception${summary.exceptionCount === 1 ? " remains" : "s remain"}${summary.allHumanPass ? " despite human Pass responses on every checklist item" : " alongside the recorded human responses"}. Human responses do not resolve equipment evidence or exceptions.`
              : "No exceptions were recorded. This count is not an equipment safety determination."}
          </p>
        </section>
        <section className="executive-overview">
          <h2>Review overview</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Engineering check</th>
                <th scope="col">Human response</th>
                <th scope="col">Open findings</th>
              </tr>
            </thead>
            <tbody>
              {summary.items.map((item) => (
                <tr key={item.id}>
                  <th scope="row">
                    {item.order}. {item.title}
                  </th>
                  <td>{item.response}</td>
                  <td>
                    {item.findings.length
                      ? item.findings.map((finding, index) => (
                          <span key={finding.id}>
                            {index > 0 && "; "}
                            {finding.asset}
                          </span>
                        ))
                      : "None recorded"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="executive-findings">
          <h2>
            Unresolved exceptions & follow-up{" "}
            <span>{summary.exceptionCount} open</span>
          </h2>
          {summary.findings.map((finding, index) => (
            <div className="executive-finding" key={finding.id}>
              <div className="executive-finding-heading">
                <strong>
                  {index + 1}. {finding.asset}
                </strong>
                <span>
                  Item {finding.itemOrder} · {finding.issueType} · Open
                </span>
              </div>
              {finding.evidenceContext && (
                <p className="executive-evidence-context">
                  {finding.evidenceContext}
                </p>
              )}
              <p className="executive-observation">
                <b>Recorded observation:</b>{" "}
                {finding.observation || "Not specified"}
              </p>
              <dl>
                <div>
                  <dt>Responsible</dt>
                  <dd
                    className={
                      finding.responsible === "Unassigned"
                        ? "missing-follow-up"
                        : ""
                    }
                  >
                    {finding.responsible}
                  </dd>
                </div>
                <div>
                  <dt>Suggested follow-up</dt>
                  <dd
                    className={
                      finding.followUp === "Not specified"
                        ? "missing-follow-up"
                        : ""
                    }
                  >
                    {finding.followUp}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
          {summary.missingFollowUpCount > 0 && (
            <p className="executive-data-quality">
              {summary.missingFollowUpCount} exception(s) have incomplete
              follow-up. Missing information is labeled; the submitted record is
              unchanged.
            </p>
          )}
        </section>
        {(summary.observations || summary.openingNotes) && (
          <section className="executive-notes">
            <h2>Technician-entered notes</h2>
            {summary.openingNotes && (
              <p>
                <b>Opening:</b> {summary.openingNotes}
              </p>
            )}
            {summary.observations && (
              <p>
                <b>Summary observations:</b> {summary.observations}
              </p>
            )}
            <small>
              Verbatim technician notes; these do not establish an overall
              clearance or resolve open findings.
            </small>
          </section>
        )}
        <footer className="executive-footer">
          <p>
            <b>Simulated monitoring time:</b>{" "}
            {summary.simulatedTimes.map(recordTime).join("; ")}. Actual
            inspection-record times are shown separately above.
          </p>
          <p className="executive-authorization">{AUTHORIZATION_STATEMENT}</p>
        </footer>
      </div>
    </article>
  );
}
