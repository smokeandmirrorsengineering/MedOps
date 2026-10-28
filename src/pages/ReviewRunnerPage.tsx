import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { Check, ChevronRight, Save } from "lucide-react";
import { useDemoData } from "../state/DemoDataProvider";
import { useReviews } from "../reviews/ReviewProvider";
import {
  captureEvidence,
  evidenceChanges,
  isAbnormal,
  isGap,
} from "../reviews/evidence";
import { blankVerification, AUTHORIZATION_STATEMENT } from "../reviews/types";
import type {
  HumanVerification,
  ReviewSession,
  TemplateItem,
} from "../reviews/types";
import type { ResponseInput } from "../reviews/model";
import {
  EvidenceView,
  HumanFields,
  ReviewHeader,
  ReviewMissing,
  ReviewNav,
  ReviewStorageNotice,
  recordTime,
} from "../reviews/ReviewComponents";
import { updateParams } from "../lib/navigation";

function ItemEditor({
  review,
  item,
  next,
}: {
  review: ReviewSession;
  item: TemplateItem;
  next: () => void;
}) {
  const { snapshot } = useDemoData(),
    reviews = useReviews();
  const recorded = review.responses[item.id];
  const current = useMemo(
    () =>
      captureEvidence(
        item,
        review.template,
        snapshot,
        reviews.sessions,
        reviews.clock.now(),
      ),
    [item, review.template, snapshot, reviews.sessions, reviews.clock],
  );
  const [form, setForm] = useState<ResponseInput>(() =>
    recorded
      ? structuredClone(recorded)
      : { ...blankVerification(), gaps: [], acknowledgedIssues: [] },
  );
  const [refresh, setRefresh] = useState(false),
    [retain, setRetain] = useState(false),
    [retentionNote, setRetentionNote] = useState(
      recorded?.changeAcknowledgement?.note ?? "",
    );
  const [errors, setErrors] = useState<string[]>([]),
    [message, setMessage] = useState("");
  const shown = recorded && !refresh ? recorded.evidence : current;
  const changes = recorded
    ? evidenceChanges(recorded.evidence, current, item)
    : [];
  const alreadyNoted =
    !!recorded?.changeAcknowledgement &&
    !evidenceChanges(recorded.changeAcknowledgement.evidence, current, item)
      .length;
  const gaps = item.kind === "gaps" ? shown.assets.filter(isGap) : [];
  const issues = [
    ...new Map(
      [...shown.issues, ...current.issues].map((issue) => [issue.key, issue]),
    ).values(),
  ];
  function save(goNext = false) {
    const result = reviews.save(
      review.id,
      item.id,
      {
        ...form,
        gaps: form.gaps.filter((gap) =>
          gaps.some((asset) => asset.id === gap.assetId),
        ),
      },
      { refresh, retentionNote: retain ? retentionNote : undefined },
    );
    setErrors(result);
    if (!result.length) {
      setRefresh(false);
      setRetain(false);
      setMessage("Response recorded. Check browser-storage status above.");
      if (goNext) next();
    }
  }
  return (
    <section className="panel review-editor">
      <header className="review-item-heading">
        <span className="small-caps">
          {item.section} · ITEM {item.order} OF 9
        </span>
        <h2>{item.title}</h2>
        <p>{item.prompt}</p>
        <div className="review-caution">{item.limitation}</div>
      </header>
      {changes.length > 0 && (
        <div className="review-change-banner" role="status">
          <strong>
            {alreadyNoted && !refresh
              ? "Evidence change was explicitly noted"
              : "Monitoring evidence has meaningfully changed"}
          </strong>
          <ul>
            {changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
          <button
            className="demo-button"
            onClick={() => {
              setRefresh(true);
              setRetain(false);
              setMessage(
                "Current evidence selected. Save the response to capture it explicitly.",
              );
            }}
          >
            Review Again / Refresh Evidence
          </button>
          {!refresh && (
            <>
              <label className="review-check">
                <input
                  type="checkbox"
                  checked={retain}
                  onChange={(event) => setRetain(event.target.checked)}
                />
                Continue using the recorded evidence with a discrepancy note
              </label>
              {retain && (
                <label>
                  Why retain the recorded evidence?
                  <textarea
                    aria-label="Evidence retention explanation"
                    rows={3}
                    value={retentionNote}
                    onChange={(event) => setRetentionNote(event.target.value)}
                  />
                </label>
              )}
            </>
          )}
          {refresh && (
            <p>
              Current evidence will replace the snapshot only when you save this
              response.
            </p>
          )}
        </div>
      )}
      <div className="review-editor-columns">
        <div className="review-system-column">
          <h3>
            A. {recorded && !refresh ? "Recorded" : "Current"} System Evidence
          </h3>
          {recorded && !refresh && (
            <p className="review-small-note">
              Captured when the response was saved:{" "}
              {recordTime(recorded.evidence.capturedAt)}. Equipment links open
              current details.
            </p>
          )}
          {shown.assets.some(isAbnormal) && (
            <div className="review-abnormal">
              <strong>Evidence requires an observation</strong>
              {(item.kind === "gaps"
                ? shown.assets.filter(isGap)
                : shown.assets.filter(isAbnormal)
              ).map((asset) => (
                <p key={asset.id}>
                  {asset.id}: {asset.condition} · {asset.connectivity} ·{" "}
                  {asset.alarms.length} active alarm(s).
                  {(asset.condition === "Critical" ||
                    asset.condition === "Unknown") &&
                    " Pass requires reconciliation and an open discrepancy."}
                </p>
              ))}
            </div>
          )}
          <EvidenceView evidence={shown} />
          {changes.length > 0 && !refresh && (
            <details className="review-current-comparison">
              <summary>Compare current equipment evidence</summary>
              <EvidenceView evidence={current} />
            </details>
          )}
        </div>
        <div className="review-human-column">
          <h3>B. Human Verification</h3>
          <p className="review-small-note">
            No response is automatic. Pass records your assessment, not a MedOps
            safety determination. Save explicitly; unsaved edits are not
            retained when leaving this item.
          </p>
          <HumanFields
            value={form}
            item={item}
            onChange={(value) => {
              setForm({ ...form, ...value });
              setMessage("");
            }}
          />
          {gaps.map((asset) => {
            const value = form.gaps.find((gap) => gap.assetId === asset.id) ?? {
              ...blankVerification(),
              assetId: asset.id,
            };
            return (
              <section className="review-gap-verification" key={asset.id}>
                <h4>{asset.id} — individual monitoring-gap verification</h4>
                <p>
                  Record a verification or exception for this affected asset.
                </p>
                <HumanFields
                  prefix={`${asset.id} `}
                  value={value}
                  item={item}
                  onChange={(updated) =>
                    setForm({
                      ...form,
                      gaps: [
                        ...form.gaps.filter((gap) => gap.assetId !== asset.id),
                        { ...updated, assetId: asset.id },
                      ],
                    })
                  }
                />
              </section>
            );
          })}
          {item.kind === "gaps" && !gaps.length && (
            <p className="review-caution">
              No unavailable, Unknown or stale source is currently shown among
              the six scoped assets. No unrelated hospital equipment is
              included.
            </p>
          )}
          {item.kind === "issues" && (
            <fieldset className="review-acknowledgements">
              <legend>
                Issues personally reviewed — acknowledgement does not resolve
                them
              </legend>
              {issues.map((issue) => (
                <label key={issue.key}>
                  <input
                    type="checkbox"
                    checked={form.acknowledgedIssues.includes(issue.key)}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        acknowledgedIssues: event.target.checked
                          ? [...form.acknowledgedIssues, issue.key]
                          : form.acknowledgedIssues.filter(
                              (key) => key !== issue.key,
                            ),
                      })
                    }
                  />
                  <span>
                    {issue.title}
                    <small>
                      {issue.assetId ?? "Scope-level issue"} · {issue.source}
                    </small>
                  </span>
                </label>
              ))}
              {!issues.length && (
                <p>
                  No relevant prior exceptions or active synthetic alarms were
                  found.
                </p>
              )}
            </fieldset>
          )}
          {errors.length > 0 && (
            <div className="review-errors" role="alert">
              <strong>Information needed before saving</strong>
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {message && (
            <p role="status" className="review-save-message">
              {message}
            </p>
          )}
          <div className="review-editor-actions">
            <button className="review-secondary" onClick={() => save(false)}>
              <Save size={14} />
              Save response
            </button>
            <button className="review-primary" onClick={() => save(true)}>
              Save & next item
              <ChevronRight size={15} />
            </button>
          </div>
          {recorded && (
            <p className="review-small-note">
              Last response save: {recordTime(recorded.savedAt)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
export function ReviewRunnerPage() {
  const { reviewId } = useParams(),
    reviews = useReviews(),
    navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const review = reviews.sessions.find((review) => review.id === reviewId);
  const [errors, setErrors] = useState<string[]>([]);
  const [summary, setSummary] = useState(review?.summary ?? "");
  useEffect(() => {
    setSummary(review?.summary ?? "");
    setErrors([]);
  }, [reviewId]);
  if (!review) return <ReviewMissing />;
  if (review.status === "Submitted")
    return <Navigate to={`/reviews/${review.id}/report`} replace />;
  const item =
    review.template.items.find((item) => item.id === params.get("item")) ??
    review.template.items[0];
  function choose(id: string) {
    setParams((current) => updateParams(current, { item: id }));
    setErrors([]);
  }
  return (
    <>
      <ReviewHeader
        title="Operating Theatre review"
        description={`${Object.keys(review.responses).length} of 9 responses saved · Draft · ${review.technician} (${review.role})`}
      />
      <ReviewNav />
      <ReviewStorageNotice />
      <div className="review-run-meta">
        <strong>
          {review.template.title} · v{review.template.version}
        </strong>
        <span>{review.scope}</span>
        <small>
          Review {review.id} · Actual creation {recordTime(review.createdAt)}
        </small>
      </div>
      <div className="review-runner">
        <nav className="review-item-nav" aria-label="Review checklist items">
          {review.template.items.map((row) => (
            <button
              key={row.id}
              aria-current={item.id === row.id ? "step" : undefined}
              onClick={() => choose(row.id)}
            >
              <span>
                {review.responses[row.id] ? <Check size={13} /> : row.order}
              </span>
              <span>{row.title}</span>
            </button>
          ))}
        </nav>
        <ItemEditor
          key={`${review.id}:${item.id}`}
          review={review}
          item={item}
          next={() => {
            const next = review.template.items[item.order];
            if (next) choose(next.id);
          }}
        />
      </div>
      <section className="panel review-submit-panel">
        <h2>Summary observations & submission</h2>
        <label>
          Summary observations
          <textarea
            aria-label="Summary observations"
            rows={3}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
        </label>
        <div className="review-actions">
          <button
            className="review-secondary"
            onClick={() => reviews.summary(review.id, summary)}
          >
            Save summary observations
          </button>
          <span className="review-small-note">
            {review.exceptions.length} current draft exceptions
          </span>
        </div>
        {review.exceptions.length > 0 && (
          <details className="review-draft-exceptions">
            <summary>Review draft exceptions and ownership</summary>
            {review.exceptions.map((exception) => (
              <div className="report-exception" key={exception.id}>
                <strong>
                  {exception.itemTitle} · {exception.assetId ?? "Scope"} ·{" "}
                  {exception.issueType}
                </strong>
                <p>{exception.observation}</p>
                <p>Responsible: {exception.responsible}</p>
                <p>Suggested follow-up: {exception.followUp}</p>
              </div>
            ))}
          </details>
        )}
        <p className="review-caution">
          Submission checks all saved responses and meaningful evidence changes.
          Open exceptions may remain. Submitted means the inspection record was
          recorded; it is not an authorization for use.
        </p>
        <p className="review-authorization">{AUTHORIZATION_STATEMENT}</p>
        {errors.length > 0 && (
          <div className="review-errors" role="alert">
            <strong>Submission needs attention</strong>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <p>
              Select the numbered checklist items above to address these
              requirements.
            </p>
          </div>
        )}
        <button
          className="review-primary"
          onClick={() => {
            reviews.summary(review.id, summary);
            const result = reviews.submit(review.id);
            setErrors(result);
            if (!result.length) navigate(`/reviews/${review.id}/report`);
          }}
        >
          Submit Review
        </button>
      </section>
    </>
  );
}
