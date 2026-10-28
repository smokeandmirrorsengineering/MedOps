import { Link } from "react-router";
import { ChevronDown, Compass, Check } from "lucide-react";
import { useGuide } from "./GuideProvider";
import { useDemoData } from "../state/DemoDataProvider";
import { FAULT_ASSET_ID } from "../simulation/types";
export function ExploreGuide() {
  const guide = useGuide(),
    data = useDemoData(),
    progress = guide.progress,
    session = guide.session;
  const steps = [
    {
      title: "Detect",
      text: "Examine or simulate an abnormal indication on AHU-OT-01.",
    },
    {
      title: "Investigate",
      text: "Open the affected asset. Inspect condition, readings, quality and activity.",
    },
    {
      title: "Verify",
      text: "Create a new three-item investigation. Record human judgment and submit.",
    },
    {
      title: "Follow Up",
      text: "Create an action from the new exception, then record progress and completion.",
    },
    {
      title: "Report & Re-verify",
      text: "View the original report and start an independent re-verification record. Clear equipment faults separately in Demo Controls.",
    },
  ];
  return (
    <details className="panel explore-guide">
      <summary>
        <Compass size={18} />
        <strong>Explore Evidanor</strong>
        <span>
          {session
            ? `${progress?.completed} of 5 guide steps recorded`
            : "A concise equipment-to-follow-up walkthrough"}
        </span>
        <ChevronDown size={16} />
      </summary>
      <div className="explore-content">
        <p>
          Optional synthetic demonstration. Ordinary pages and actions work
          independently. Only activity and records associated with this guide
          session count toward progress.
        </p>
        {guide.status !== "saved" && (
          <p className="followup-storage" role="status">
            {guide.status === "unavailable"
              ? "Guide progress is in memory only; browser storage is unavailable."
              : "Saved guide progress could not be restored. Engineering records were not changed."}
          </p>
        )}
        {!session ? (
          <button className="review-primary" onClick={guide.start}>
            Start Guide
          </button>
        ) : (
          <>
            <div className="guide-session-bar">
              <small>Current guide session · {session.id}</small>
              <button className="review-secondary" onClick={guide.restart}>
                Restart Guide
              </button>
              <button className="review-secondary" onClick={guide.exit}>
                Exit Guide
              </button>
            </div>
            <ol>
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span
                    className={`guide-step-number ${progress?.done[index] ? "is-recorded" : ""}`}
                  >
                    {progress?.done[index] ? <Check size={16} /> : index + 1}
                  </span>
                  <div>
                    <h3>
                      {step.title}{" "}
                      <small>
                        {progress?.done[index]
                          ? "Recorded this session"
                          : "Next action"}
                      </small>
                    </h3>
                    <p>{step.text}</p>
                    {index === 0 && (
                      <button
                        className="review-secondary"
                        disabled={
                          !!data.simulation.fault ||
                          !!data.simulation.connections[FAULT_ASSET_ID]
                        }
                        onClick={() =>
                          data.dispatch({ type: "ACTIVATE_FAULT" })
                        }
                      >
                        {data.simulation.fault
                          ? "AHU fault active"
                          : "Simulate AHU Fault"}
                      </button>
                    )}
                    {index === 0 &&
                      data.simulation.connections[FAULT_ASSET_ID] && (
                        <p className="review-field-hint">
                          Restore monitoring using Demo Controls before
                          injecting a new fault.
                        </p>
                      )}
                    {index === 1 && (
                      <Link
                        className="text-link"
                        to={`/assets?asset=${FAULT_ASSET_ID}`}
                      >
                        Inspect AHU-OT-01
                      </Link>
                    )}
                    {index === 2 && (
                      <div className="guide-step-links">
                        <Link
                          className="text-link"
                          to={`/reviews/new?template=focused&subject=${FAULT_ASSET_ID}`}
                        >
                          Start Focused Investigation
                        </Link>
                        {progress?.review && (
                          <Link
                            className="text-link"
                            to={`/reviews/${progress.review.id}/${progress.review.status === "Submitted" ? "report" : "run"}`}
                          >
                            {progress.review.status === "Submitted"
                              ? "Open guide review report"
                              : "Resume guide draft"}
                          </Link>
                        )}
                      </div>
                    )}
                    {index === 3 && (
                      <Link
                        className="text-link"
                        to={
                          progress?.action
                            ? `/reviews/issues?followup=${encodeURIComponent(progress.action.id)}`
                            : progress?.review?.status === "Submitted"
                              ? `/reviews/issues?review=${encodeURIComponent(progress.review.id)}`
                              : "/reviews"
                        }
                      >
                        {progress?.action
                          ? "Open guide follow-up"
                          : progress?.review?.status === "Submitted"
                            ? "Open this review's issues"
                            : "Review history — submit a new review first"}
                      </Link>
                    )}
                    {index === 4 && (
                      <div className="guide-step-links">
                        {progress?.review?.status === "Submitted" ? (
                          <Link
                            className="text-link"
                            to={`/reviews/${progress.review.id}/report`}
                          >
                            Open original submitted report
                          </Link>
                        ) : (
                          <Link className="text-link" to="/reviews">
                            View Engineering Reviews
                          </Link>
                        )}
                        {progress?.action?.status === "Action Completed" && (
                          <Link
                            className="text-link"
                            to={`/reviews/new?template=focused&subject=${session.targetAssetId}&fromFollowUp=${encodeURIComponent(progress.action.id)}`}
                          >
                            Start Re-verification
                          </Link>
                        )}
                        {progress?.reVerification && (
                          <Link
                            className="text-link"
                            to={`/reviews/${progress.reVerification.id}/run`}
                          >
                            Independent re-verification draft started
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="guide-reset-note">
              Restart and Exit clear only guide progress. Reviews, original
              exceptions, follow-ups and equipment history remain intact. A
              started re-verification draft does not mean equipment has been
              re-verified.
            </p>
          </>
        )}
      </div>
    </details>
  );
}
