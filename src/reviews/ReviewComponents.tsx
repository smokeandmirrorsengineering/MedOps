import { Link } from "react-router";
import {
  ArrowLeft,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
} from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useAssetSelection } from "../state/useAssetSelection";
import { date, time } from "../lib/format";
import { useReviews } from "./ReviewProvider";
import type {
  EvidenceSnapshot,
  HumanVerification,
  TemplateItem,
} from "./types";

export const recordTime = (value: string) =>
  `${date(value)} · ${time(value)} BDT (UTC+6)`;
export function ReviewHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="breadcrumb">
          Workspace <ChevronRight size={12} />
          <Link to="/reviews">Engineering Reviews</Link>
        </div>
        <h1 tabIndex={-1}>
          {title}
          <span className="title-dot">.</span>
        </h1>
        <p>{description}</p>
      </div>
      <ClipboardCheck className="review-heading-icon" size={28} />
    </div>
  );
}
export function ReviewNav() {
  return (
    <nav className="review-module-nav">
      <Link to="/reviews">Reviews home</Link>
      <Link to="/reviews/new">Start New Review</Link>
      <Link to="/reviews/issues">Open Issues</Link>
    </nav>
  );
}
export function ReviewStorageNotice() {
  const { status, sessions } = useReviews();
  return (
    <div className={`review-storage ${status}`} role="status">
      {status === "unavailable"
        ? "NOT SAVED TO BROWSER — review changes are in memory only. Storage is unavailable or full; do not rely on a refresh preserving this record."
        : status === "recovered"
          ? "Saved review data was invalid or incompatible and could not be restored. Equipment simulations were not changed."
          : sessions.length
            ? "Review records saved in this browser only · typed identities are unverified"
            : "Browser-local review storage · no authenticated identities or digital signatures"}
    </div>
  );
}
export function ReviewMissing() {
  return (
    <section className="panel empty-state">
      <h1>Review not found</h1>
      <p>This record is unavailable in this browser profile.</p>
      <Link className="text-link" to="/reviews">
        <ArrowLeft size={14} />
        Reviews home
      </Link>
    </section>
  );
}
export function EvidenceView({
  evidence,
  interactive = true,
}: {
  evidence: EvidenceSnapshot;
  interactive?: boolean;
}) {
  const { openAsset } = useAssetSelection();
  return (
    <div className="review-system-evidence">
      <div className="evidence-clock">
        <strong>SYNTHETIC SYSTEM EVIDENCE</strong>
        <span>
          Simulated monitoring time: {recordTime(evidence.simulatedAt)}
        </span>
        <span>Actual evidence capture: {recordTime(evidence.capturedAt)}</span>
      </div>
      {!evidence.assets.length && !evidence.issues.length && (
        <p className="evidence-empty">
          No automatic monitoring evidence is linked. Human verification is
          required.
        </p>
      )}
      {evidence.assets.map((asset) => (
        <div className="review-evidence-asset" key={asset.id}>
          <div className="evidence-asset-heading">
            <div>
              {interactive ? (
                <button
                  className="text-link mono"
                  onClick={() => openAsset(asset.id)}
                >
                  {asset.id}
                  <ExternalLink size={12} />
                </button>
              ) : (
                <strong className="mono">{asset.id}</strong>
              )}
              <span>{asset.name}</span>
            </div>
            <StatusBadge condition={asset.condition} />
          </div>
          <p className="evidence-location">{asset.location}</p>
          <dl className="review-evidence-meta">
            <div>
              <dt>Operating state</dt>
              <dd>{asset.operatingState}</dd>
            </div>
            <div>
              <dt>Connectivity</dt>
              <dd>{asset.connectivity}</dd>
            </div>
            <div>
              <dt>Monitoring method</dt>
              <dd>{asset.method}</dd>
            </div>
          </dl>
          <p className="evidence-source">{asset.source}</p>
          <div className="review-reading-list">
            {asset.readings.map((reading) => (
              <div
                className={
                  reading.validity === "Last known / unavailable" ||
                  reading.validity === "Stale"
                    ? "unavailable"
                    : ""
                }
                key={reading.pointId}
              >
                <span>{reading.label}</span>
                <strong>
                  {reading.value ?? "—"} {reading.unit}
                </strong>
                <small>
                  {reading.quality} · {reading.validity}
                  <br />
                  {time(reading.timestamp)} BDT
                </small>
              </div>
            ))}
          </div>
          <div className="review-evidence-notes">
            <strong>Evaluated evidence</strong>
            {asset.reasons.map((reason) => (
              <p key={reason}>{reason}</p>
            ))}
            {asset.alarms.length > 0 && (
              <>
                <strong>Active alarm evidence</strong>
                {asset.alarms.map((alarm) => (
                  <p key={alarm.id}>
                    {alarm.severity} · {alarm.title}
                  </p>
                ))}
              </>
            )}
            <strong>Available maintenance metadata</strong>
            {asset.maintenance.map((record, index) => (
              <p key={index}>
                Last service {record.lastServiceDate} · next{" "}
                {record.nextServiceDate}. {record.summary}
              </p>
            ))}
          </div>
        </div>
      ))}
      {evidence.issues.map((issue) => (
        <div className="review-carried-evidence" key={issue.key}>
          <strong>{issue.title}</strong>
          <p>
            {issue.assetId ?? "Scope-level issue"} · {issue.source}
          </p>
          <p>{issue.observation}</p>
          {issue.reviewId && <p>Originating review: {issue.reviewId}</p>}
        </div>
      ))}
    </div>
  );
}
export function HumanFields({
  value,
  item,
  onChange,
  prefix = "",
}: {
  value: HumanVerification;
  item: TemplateItem;
  onChange: (value: HumanVerification) => void;
  prefix?: string;
}) {
  const field = (
    key: keyof HumanVerification,
    text: string,
    multiline = true,
  ) => (
    <label className={key === "responsible" ? "" : "review-field-wide"}>
      {text}
      {multiline ? (
        <textarea
          aria-label={prefix + text}
          value={value[key]}
          onChange={(event) =>
            onChange({ ...value, [key]: event.target.value })
          }
          rows={key === "observation" ? 3 : 2}
        />
      ) : (
        <input
          aria-label={prefix + text}
          value={value[key]}
          onChange={(event) =>
            onChange({ ...value, [key]: event.target.value })
          }
        />
      )}
    </label>
  );
  return (
    <div className="review-human-fields">
      <fieldset className="review-response-choices">
        <legend>{prefix}Human response</legend>
        {item.allowedResponses.map((choice) => (
          <label key={choice}>
            <input
              type="radio"
              name={`${prefix || item.id}-choice`}
              checked={value.choice === choice}
              value={choice}
              onChange={() => onChange({ ...value, choice })}
            />
            {choice}
          </label>
        ))}
      </fieldset>
      <label className="review-field-wide">
        Verification method
        <select
          aria-label={prefix + "Verification method"}
          value={value.method}
          onChange={(event) =>
            onChange({
              ...value,
              method: event.target.value as HumanVerification["method"],
            })
          }
        >
          <option value="">Choose a method — no default</option>
          {item.allowedMethods.map((method) => (
            <option key={method}>{method}</option>
          ))}
        </select>
      </label>
      {field("observation", "Human observations")}
      {field("notes", "Supporting notes (optional)")}
      {field("reconciliation", "Reconciliation note")}
      {field("responsible", "Responsible role / person", false)}
      {field("followUp", "Suggested follow-up")}
    </div>
  );
}
