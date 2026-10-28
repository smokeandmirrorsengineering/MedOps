import { useState } from "react";
import { useNavigate } from "react-router";
import { useReviews } from "../reviews/ReviewProvider";
import { otTemplate } from "../reviews/template";
import {
  ReviewHeader,
  ReviewNav,
  ReviewStorageNotice,
} from "../reviews/ReviewComponents";
export function ReviewStartPage() {
  const reviews = useReviews(),
    navigate = useNavigate();
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
            const id = reviews.start({ technician, role, openingNotes });
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
            value={otTemplate.id}
            onChange={() => {}}
          >
            <option value={otTemplate.id}>
              {otTemplate.title} · v{otTemplate.version}
            </option>
          </select>
        </label>
        <label>
          Fictional review scope
          <input
            aria-label="Fictional review scope"
            readOnly
            value={otTemplate.scope}
          />
          <small>
            Supported common OT engineering area only; no individual-theatre
            association.
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
        <p className="review-caution">{otTemplate.disclaimer}</p>
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
