import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useReviews } from "../reviews/ReviewProvider";
import { otTemplate } from "../reviews/template";
import { focusedTemplate, FOCUSED_TEMPLATE_ID } from "../reviews/focused";
import { useDemoData } from "../state/DemoDataProvider";
import { useFollowUps } from "../followups/FollowUpProvider";
import {
  ReviewHeader,
  ReviewNav,
  ReviewStorageNotice,
} from "../reviews/ReviewComponents";
export function ReviewStartPage() {
  const reviews = useReviews(),
    navigate = useNavigate();
  const [params] = useSearchParams(),
    { snapshot } = useDemoData(),
    followups = useFollowUps();
  const [templateId, setTemplateId] = useState(
    params.get("template") === "focused" ||
      params.get("template") === FOCUSED_TEMPLATE_ID
      ? FOCUSED_TEMPLATE_ID
      : otTemplate.id,
  );
  const [subject, setSubject] = useState(
    snapshot.assets.some((asset) => asset.id === params.get("subject"))
      ? params.get("subject")!
      : "",
  );
  const focused = templateId === FOCUSED_TEMPLATE_ID;
  const template =
    focused && subject ? focusedTemplate(snapshot, subject) : otTemplate;
  const source = followups.records.find(
    (record) => record.id === params.get("fromFollowUp"),
  );
  useEffect(() => {
    setTemplateId(
      params.get("template") === "focused" ||
        params.get("template") === FOCUSED_TEMPLATE_ID
        ? FOCUSED_TEMPLATE_ID
        : otTemplate.id,
    );
    setSubject(
      snapshot.assets.some((asset) => asset.id === params.get("subject"))
        ? params.get("subject")!
        : "",
    );
  }, [
    params.get("template"),
    params.get("subject"),
    params.get("fromFollowUp"),
  ]);
  const [technician, setTechnician] = useState(""),
    [role, setRole] = useState(""),
    [openingNotes, setNotes] = useState(""),
    [error, setError] = useState("");
  return (
    <>
      <ReviewHeader
        title="Start Engineering Review"
        description="Create a browser-local draft. Equipment monitoring time and actual review time are recorded separately."
      />
      <ReviewNav />
      <ReviewStorageNotice />
      <form
        className="panel review-start-form"
        onSubmit={(event) => {
          event.preventDefault();
          try {
            if (
              focused &&
              params.get("fromFollowUp") &&
              (!source ||
                source.status !== "Action Completed" ||
                source.assetId !== subject)
            )
              throw Error(
                "The re-verification source must be a completed action for this same asset.",
              );
            const id = reviews.start({
              technician,
              role,
              openingNotes,
              templateId,
              ...(focused
                ? {
                    subjectAssetId: subject,
                    ...(source ? { sourceFollowUpId: source.id } : {}),
                  }
                : {}),
            });
            navigate(`/reviews/${id}/run`);
          } catch (error) {
            setError((error as Error).message);
          }
        }}
      >
        <h2>Review details</h2>
        <label>
          Template
          <select
            aria-label="Review template"
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
          >
            <option value={otTemplate.id}>
              {otTemplate.title} · v{otTemplate.version}
            </option>
            <option value={FOCUSED_TEMPLATE_ID}>
              Focused Equipment Investigation · v1.0 · 3 items
            </option>
          </select>
        </label>
        {focused && (
          <label>
            Subject equipment
            <select
              aria-label="Subject equipment"
              value={subject}
              required
              onChange={(event) => setSubject(event.target.value)}
            >
              <option value="">Choose an existing asset</option>
              {snapshot.assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.id} · {asset.name}
                </option>
              ))}
            </select>
            <small>
              The selected asset is bound to this new session from creation.
              Existing drafts are never overwritten.
            </small>
          </label>
        )}
        {focused && source && (
          <p className="review-caution">
            New independent re-verification record linked to {source.id}. The
            completed action and original inspection remain unchanged.
          </p>
        )}
        <label>
          Fictional review scope
          <input
            aria-label="Fictional review scope"
            readOnly
            value={
              focused && !subject
                ? "Select equipment to define the investigation scope."
                : template.scope
            }
          />
          <small>
            {focused
              ? "This investigation concerns only the selected asset; it does not create service relationships to other equipment."
              : "Supported common OT engineering area only; no individual-theatre association."}
          </small>
        </label>
        <div className="review-form-columns">
          <label>
            Technician name
            <input
              aria-label="Technician name"
              required
              value={technician}
              onChange={(event) => setTechnician(event.target.value)}
            />
          </label>
          <label>
            Technician role
            <input
              aria-label="Technician role"
              required
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
          </label>
        </div>
        <p className="review-caution">
          Typed information is unverified. It is not an authenticated identity
          or legally binding signature.
        </p>
        <label>
          Opening notes (optional)
          <textarea
            aria-label="Opening notes"
            rows={3}
            value={openingNotes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <p className="review-caution">
          {focused && !subject
            ? "Synthetic equipment investigation. Typed identities are unverified; no equipment authorization is recorded."
            : template.disclaimer}
        </p>
        {error && (
          <p role="alert" className="review-error">
            {error}
          </p>
        )}
        <button className="review-primary" type="submit">
          Create Draft & Start Review
        </button>
      </form>
    </>
  );
}
