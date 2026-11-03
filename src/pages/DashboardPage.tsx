import {
  ArrowRight,
  ChevronDown,
  ClipboardCheck,
  FileClock,
  FlaskConical,
  ListChecks,
  Plus,
  Radio,
} from "lucide-react";
import { Link } from "react-router";
import { categories } from "../domain/types";
import { useDemoData } from "../state/DemoDataProvider";
import { useReviews } from "../reviews/ReviewProvider";
import { openReviewIssues } from "../reviews/evidence";
import { categoryMetadata } from "../lib/categories";
import { orderAssets } from "../lib/navigation";
import { time } from "../lib/format";
import { useAssetSelection } from "../state/useAssetSelection";
import { StatusBadge, conditionIcons } from "../components/StatusBadge";
import { PageHeading } from "../components/PageHeading";
import { DemoControls, SimulationBadge } from "../components/DemoControls";
import { ExploreGuide } from "../guide/ExploreGuide";
import { ServiceDashboardEntry } from "../service/ServiceIntegration";

export function DashboardPage() {
  const data = useDemoData();
  const { sessions } = useReviews();
  const { openAsset } = useAssetSelection();
  const priorityAssets = orderAssets(data.evaluated).filter(
    (asset) => asset.condition !== "Normal",
  );
  const issues = openReviewIssues(sessions);
  const drafts = sessions
    .filter((review) => review.status === "Draft")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <PageHeading
        page="Overview"
        title="Engineering Overview"
        description="MedOps Demo Hospital · Engineering priorities across your facility."
        actions={
          <>
            <Link className="action-secondary" to="/reviews/issues">
              <ListChecks size={16} />
              Open Issues{issues.length > 0 && <span>{issues.length}</span>}
            </Link>
            <Link className="action-primary" to="/reviews/new">
              <Plus size={16} />
              Start Engineering Review
            </Link>
          </>
        }
      />
      <section
        className="condition-strip"
        aria-label="Equipment condition totals"
      >
        {(["Critical", "Attention", "Unknown", "Normal"] as const).map(
          (condition) => {
            const Icon = conditionIcons[condition];
            return (
              <Link
                className={`condition-total ${condition.toLowerCase()}`}
                key={condition}
                to={`/assets?condition=${condition}`}
                aria-label={`${condition}: ${data.counts[condition]}. Filter inventory`}
              >
                <Icon size={18} />
                <span>
                  {condition}
                  <small>
                    {condition === "Unknown"
                      ? "Evidence uncertainty"
                      : condition === "Critical"
                        ? "Priority review"
                        : condition === "Attention"
                          ? "Review or service"
                          : "Within demo criteria"}
                  </small>
                </span>
                <strong>{data.counts[condition]}</strong>
              </Link>
            );
          },
        )}
        <Link className="fleet-total" to="/assets">
          <span>
            Total fleet<strong>{data.total} assets</strong>
          </span>
          <ArrowRight size={16} />
        </Link>
      </section>
      <div className="operations-grid">
        <section
          className="panel attention-queue"
          aria-labelledby="attention-title"
        >
          <div className="panel-heading">
            <div>
              <h2 id="attention-title">
                Needs Attention{" "}
                <span className="inventory-count">{priorityAssets.length}</span>
              </h2>
              <p>Equipment requiring review · priority first</p>
            </div>
            <Link className="text-link" to="/assets">
              View inventory <ArrowRight size={14} />
            </Link>
          </div>
          <div className="operations-queue">
            {priorityAssets.slice(0, 7).map((asset) => {
              const location = data.snapshot.locations.find(
                (location) => location.id === asset.locationId,
              )!;
              const scenario = data.getAssetSimulation(asset.id);
              return (
                <button
                  className="operations-row"
                  key={asset.id}
                  onClick={() => openAsset(asset.id)}
                  aria-label={`Inspect ${asset.id}: ${asset.condition}`}
                >
                  <span className="queue-condition">
                    <StatusBadge condition={asset.condition} />
                  </span>
                  <span className="queue-main">
                    <span className="queue-identity">
                      <b className="mono">{asset.id}</b>
                      <span>{asset.name}</span>
                    </span>
                    <span className="queue-reason">{asset.reasons[0]}</span>
                    {scenario.lastConfirmedCritical && (
                      <span className="queue-unverified">
                        Last confirmed Critical · currently unverified
                      </span>
                    )}
                    <span className="queue-location">
                      {[
                        ...new Set([
                          categoryMetadata[asset.category].label,
                          location.department,
                          location.room,
                        ]),
                      ].join(" · ")}
                    </span>
                    <SimulationBadge assetId={asset.id} />
                  </span>
                  <span className="queue-time">
                    {asset.lastReported ? (
                      <>
                        {time(asset.lastReported)}
                        <small>BDT · reported</small>
                      </>
                    ) : (
                      <>
                        No report<small>Evidence unavailable</small>
                      </>
                    )}
                    <ArrowRight size={16} />
                  </span>
                </button>
              );
            })}
            {!priorityAssets.length && (
              <div className="empty-state">
                <h3>No abnormal equipment conditions</h3>
                <p>
                  All available evidence is within the fictional demonstration
                  criteria.
                </p>
              </div>
            )}
          </div>
          <div className="queue-footer">
            <span>
              One entry per asset. Unknown indicates evidence uncertainty.
            </span>
            <Link to="/alerts" className="text-link">
              All alerts <ArrowRight size={14} />
            </Link>
          </div>
        </section>
        <div className="operations-aside">
          <section className="panel affected-systems">
            <div className="panel-heading">
              <div>
                <h2>Affected Systems</h2>
                <p>Conditions to review / category fleet</p>
              </div>
            </div>
            {categories.map((category) => {
              const members = data.evaluated.filter(
                (asset) => asset.category === category,
              );
              const affected = members.filter(
                (asset) => asset.condition !== "Normal",
              );
              const Icon = categoryMetadata[category].icon;
              return (
                <Link
                  key={category}
                  to={`/assets?system=${categoryMetadata[category].slug}`}
                  className="affected-system-row"
                >
                  <span className="system-glyph">
                    <Icon size={18} />
                  </span>
                  <span>
                    <strong>{categoryMetadata[category].label}</strong>
                    <small>
                      {
                        affected.filter((a) => a.condition === "Critical")
                          .length
                      }{" "}
                      critical ·{" "}
                      {
                        affected.filter((a) => a.condition === "Attention")
                          .length
                      }{" "}
                      attention ·{" "}
                      {affected.filter((a) => a.condition === "Unknown").length}{" "}
                      unknown
                    </small>
                  </span>
                  <b>
                    {affected.length}
                    <small> / {members.length}</small>
                  </b>
                </Link>
              );
            })}
          </section>
          <section className="panel next-steps">
            <div className="panel-heading">
              <h2>Next Steps</h2>
            </div>
            {issues.length > 0 ? (
              <Link to="/reviews/issues">
                <ListChecks size={18} />
                <span>
                  <strong>{issues.length} open review issues</strong>
                  <small>View observations, ownership and follow-up</small>
                </span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <p className="next-step-empty">
                <ListChecks size={18} />
                No submitted-review exceptions
              </p>
            )}
            {drafts.length > 0 ? (
              <Link to={`/reviews/${drafts[0].id}/run`}>
                <FileClock size={18} />
                <span>
                  <strong>
                    Resume review draft{" "}
                    <small className="inline-count">{drafts.length}</small>
                  </strong>
                  <small>
                    {Object.keys(drafts[0].responses).length} of{" "}
                    {drafts[0].template.items.length} saved ·{" "}
                    {drafts[0].technician}
                  </small>
                </span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <p className="next-step-empty">
                <ClipboardCheck size={18} />
                No reviews in progress
              </p>
            )}
            {data.counts.Unknown > 0 ? (
              <Link to="/assets?condition=Unknown">
                <Radio size={18} />
                <span>
                  <strong>
                    {data.counts.Unknown} unknown equipment condition
                    {data.counts.Unknown === 1 ? "" : "s"}
                  </strong>
                  <small>Inspect monitoring and evidence gaps</small>
                </span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <p className="next-step-empty">
                <Radio size={18} />
                No Unknown equipment conditions
              </p>
            )}
          </section>
        </div>
      </div>
      <ServiceDashboardEntry />
      <ExploreGuide />
      <details className="panel demo-disclosure" id="demo-controls">
        <summary>
          <FlaskConical size={18} />
          <strong>Demo Controls</strong>
          <span>
            {data.simulation.fault ||
            Object.keys(data.simulation.connections).length
              ? "Simulation changes active"
              : "Fault & connectivity scenarios"}
          </span>
          <ChevronDown size={16} />
        </summary>
        <DemoControls />
      </details>
    </>
  );
}
