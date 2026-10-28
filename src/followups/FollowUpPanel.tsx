import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { X } from "lucide-react";
import { useReviews } from "../reviews/ReviewProvider";
import { recordTime } from "../reviews/ReviewComponents";
import { hasFollowUpText } from "../reviews/followUp";
import { useFollowUps } from "./FollowUpProvider";
import { useFollowUpSelection } from "./useFollowUpSelection";
import { COMPLETION_LABEL, type FollowUp } from "./types";
import type { ReviewSession, ReviewException } from "../reviews/types";

export function FollowUpPanel() {
  const selection = useFollowUpSelection(),
    { records } = useFollowUps(),
    { sessions } = useReviews();
  if (!selection.id && !selection.source) return null;
  const record = records.find((record) => record.id === selection.id);
  const review = sessions.find((review) =>
    record
      ? review.id === record.sourceReviewId
      : review.status === "Submitted" &&
        review.exceptions.some(
          (exception) => exception.id === selection.source,
        ),
  );
  const exception = review?.exceptions.find(
    (exception) =>
      exception.id === (record?.sourceExceptionId ?? selection.source),
  );
  return (
    <FollowUpEditor
      key={record?.id ?? selection.source ?? "missing"}
      record={record}
      review={review}
      exception={exception}
      close={selection.close}
      show={selection.show}
    />
  );
}
function FollowUpEditor({
  record,
  review,
  exception,
  close,
  show,
}: {
  record?: FollowUp;
  review?: ReviewSession;
  exception?: ReviewException;
  close(): void;
  show(id: string): void;
}) {
  const followups = useFollowUps(),
    panel = useRef<HTMLDivElement>(null),
    closeAction = useRef(close);
  closeAction.current = close;
  const [responsible, setResponsible] = useState(
    record?.responsible ??
      (hasFollowUpText(exception?.responsible ?? "")
        ? exception!.responsible
        : ""),
  );
  const [action, setAction] = useState(
    record?.proposedAction ??
      (hasFollowUpText(exception?.followUp ?? "") ? exception!.followUp : ""),
  );
  const [status, setStatus] = useState(record?.status ?? "Open"),
    [note, setNote] = useState("");
  const [errors, setErrors] = useState<string[]>([]),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null,
      scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current
      ?.querySelector<HTMLButtonElement>('button[aria-label="Close follow-up"]')
      ?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAction.current();
      if (event.key === "Tab") {
        const controls = [
          ...(panel.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled)",
          ) ?? []),
        ].filter((element) => element.getClientRects().length);
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = scroll;
      if (previous?.isConnected) previous.focus();
      else document.querySelector<HTMLElement>("main h1")?.focus();
    };
  }, []);
  const completed = record?.status === "Action Completed";
  function save() {
    setSaved(false);
    if (record) {
      const result = followups.update(record.id, {
        responsible,
        proposedAction: action,
        status,
        note,
      });
      setErrors(result);
      if (!result.length) {
        setNote("");
        setSaved(true);
      }
    } else if (review && exception) {
      const result = followups.create(review.id, exception.id, {
        responsible,
        proposedAction: action,
      });
      setErrors(result.errors);
      if (result.id && !result.errors.length) show(result.id);
    }
  }
  return (
    <div className="drawer-layer operational-layer no-print" onClick={close}>
      <div
        className="asset-drawer followup-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={
          record ? "Engineering follow-up" : "Create Engineering Follow-Up"
        }
        ref={panel}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="drawer-header">
          <div>
            <strong>ENGINEERING FOLLOW-UP</strong>
            <small>
              {record?.id ?? "New action from a submitted exception"}
            </small>
          </div>
          <button
            className="icon-button"
            aria-label="Close follow-up"
            onClick={close}
          >
            <X size={20} />
          </button>
        </header>
        <div className="drawer-body drawer-content operational-content">
          {!record && (!review || !exception) ? (
            <>
              <h2>Source record unavailable</h2>
              <p>
                This exception or follow-up was not found in this browser
                profile.
              </p>
              <Link className="text-link" to="/reviews/issues">
                Open Issues
              </Link>
            </>
          ) : (
            <>
              <h2>{record ? "Follow-up action" : "Create Follow-Up"}</h2>
              <span className="action-status">
                {record?.status ?? "Open on creation"}
              </span>
              <p className="operational-note">
                Synthetic demonstration · Current action data is separate from
                the original inspection. Updating this action never changes
                equipment or closes the inspection exception.
              </p>
              <section className="original-finding">
                <h3>Original recorded issue</h3>
                <p>{record?.description ?? exception?.observation}</p>
                <small>
                  {record?.assetId ??
                    exception?.assetId ??
                    "Scope-level finding"}
                </small>
                {review ? (
                  <Link
                    className="text-link"
                    to={`/reviews/${review.id}/report`}
                  >
                    Source submitted review · {review.id}
                  </Link>
                ) : (
                  <small>
                    Source review unavailable in this browser; the recorded
                    issue copy is retained.
                  </small>
                )}
              </section>
              <div className="followup-storage" role="status">
                {followups.status === "unavailable"
                  ? "NOT SAVED TO BROWSER — actions are in memory only; storage is unavailable or full."
                  : followups.status === "recovered"
                    ? "Saved follow-up data was invalid or incompatible and could not be restored. Reviews and equipment were not changed."
                    : "Follow-ups saved separately in this browser · unverified typed responsibility"}
              </div>
              <label>
                Responsible role / person
                <input
                  aria-label="Follow-up responsible role / person"
                  value={responsible}
                  disabled={completed}
                  onChange={(event) => setResponsible(event.target.value)}
                />
              </label>
              <label>
                Proposed action
                <textarea
                  aria-label="Proposed action"
                  rows={3}
                  value={action}
                  disabled={completed}
                  onChange={(event) => setAction(event.target.value)}
                />
              </label>
              {record && !completed && (
                <>
                  <label>
                    Action status
                    <select
                      aria-label="Action status"
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as typeof status)
                      }
                    >
                      <option value={record.status}>{record.status}</option>
                      {record.status === "Open" ? (
                        <option>In Progress</option>
                      ) : (
                        <option>Action Completed</option>
                      )}
                    </select>
                  </label>
                  <label>
                    {status === "Action Completed"
                      ? "Completion note (required)"
                      : "Progress note"}
                    <textarea
                      aria-label={
                        status === "Action Completed"
                          ? "Completion note"
                          : "Progress note"
                      }
                      rows={3}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </label>
                </>
              )}
              {errors.length > 0 && (
                <div className="review-errors" role="alert">
                  <ul>
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {saved && (
                <p role="status">
                  Action update recorded. Check browser-storage status above.
                </p>
              )}
              {!completed && (
                <button className="review-primary" onClick={save}>
                  {record ? "Save action update" : "Create Follow-Up"}
                </button>
              )}
              {completed && (
                <div className="completion-note">
                  <strong>{COMPLETION_LABEL}</strong>
                  <p>
                    The original exception remains Open. A new engineering
                    review is needed to record independent re-verification.
                  </p>
                  {record?.assetId && (
                    <Link
                      className="review-primary"
                      to={`/reviews/new?template=focused&subject=${encodeURIComponent(record.assetId)}&fromFollowUp=${encodeURIComponent(record.id)}`}
                    >
                      Start Re-verification
                    </Link>
                  )}
                  {!record?.assetId && (
                    <Link className="review-secondary" to="/reviews/new">
                      Start a new Engineering Review
                    </Link>
                  )}
                </div>
              )}
              {record && (
                <>
                  <p className="review-small-note">
                    Actual creation {recordTime(record.createdAt)} · updated{" "}
                    {recordTime(record.updatedAt)}
                  </p>
                  <section className="followup-history">
                    <h3>Status history</h3>
                    {record.history.map((event) => (
                      <div key={event.id}>
                        <strong>
                          {event.from
                            ? `${event.from} → ${event.to}`
                            : event.to}
                        </strong>
                        <small>
                          {recordTime(event.at)} · Actual action record
                        </small>
                        {event.note && <p>{event.note}</p>}
                      </div>
                    ))}
                  </section>
                  <section className="followup-history">
                    <h3>Progress notes</h3>
                    {record.progressNotes.map((note) => (
                      <div key={note.id}>
                        <small>{recordTime(note.at)} · Actual record</small>
                        <p>{note.text}</p>
                      </div>
                    ))}
                    {!record.progressNotes.length && (
                      <p>No progress notes recorded.</p>
                    )}
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
