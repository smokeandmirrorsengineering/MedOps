import {
  ArrowRight,
  Box,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Radio,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { categories } from "../domain/types";
import { useDemoData } from "../state/DemoDataProvider";
import { categoryMetadata } from "../lib/categories";
import { conditions, orderAssets } from "../lib/navigation";
import { useAssetSelection } from "../state/useAssetSelection";
import { AlertRow } from "../components/AlertRow";
import { StatusBadge } from "../components/StatusBadge";
import { PageHeading } from "../components/PageHeading";
import { DemoControls, SimulationBadge } from "../components/DemoControls";
export function DashboardPage() {
  const data = useDemoData();
  const { activeEvents } = data;
  const navigate = useNavigate();
  const { openAsset } = useAssetSelection();
  const normalPercent = Math.round((data.counts.Normal / data.total) * 100);
  const attentionCount =
    data.counts.Attention + data.counts.Critical + data.counts.Unknown;
  const priorityAssets = orderAssets(data.evaluated).filter(
    (a) => a.condition !== "Normal",
  );
  return (
    <>
      <PageHeading
        page="Dashboard"
        title="Engineering overview"
        description="A clear view of the systems that keep care moving."
      />
      <div className="demo-banner">
        <span className="demo-banner-icon">
          <Radio size={16} />
        </span>
        <p>
          <strong>Your hospital, in view.</strong> You’re exploring a fictional
          facility with synthetic equipment data.
        </p>
        <span className="demo-label">DEMO ENVIRONMENT</span>
      </div>
      <section className="kpi-grid" aria-label="Equipment condition totals">
        {(
          [
            {
              label: "Total assets",
              value: data.total,
              icon: Box,
              tone: "total",
              note: `Across ${categories.length} engineering systems`,
              filter: "",
            },
            {
              label: "Normal",
              value: data.counts.Normal,
              icon: CheckCheck,
              tone: "normal",
              note: "Within demo condition limits",
              filter: "Normal",
            },
            {
              label: "Attention",
              value: data.counts.Attention,
              icon: CircleAlert,
              tone: "attention",
              note: "Review or service required",
              filter: "Attention",
            },
            {
              label: "Critical",
              value: data.counts.Critical,
              icon: TriangleAlert,
              tone: "critical",
              note: "Priority engineering review",
              filter: "Critical",
            },
            {
              label: "Unknown",
              value: data.counts.Unknown,
              icon: CircleHelp,
              tone: "unknown",
              note: "Monitoring data unavailable",
              filter: "Unknown",
            },
          ] as const
        ).map((kpi) => (
          <button
            key={kpi.label}
            className={`kpi-card ${kpi.tone}`}
            onClick={() => {
              navigate(
                kpi.filter ? "/assets?condition=" + kpi.filter : "/assets",
              );
            }}
            aria-label={`${kpi.label}: ${kpi.value}. Filter inventory`}
          >
            <span className="kpi-label">
              {kpi.label}
              <span className="kpi-icon">
                <kpi.icon size={17} />
              </span>
            </span>
            <strong>{kpi.value.toString().padStart(2, "0")}</strong>
            <span className="kpi-note">{kpi.note}</span>
          </button>
        ))}
      </section>
      <DemoControls />
      <div className="review-dashboard-link"><span>Record the human inspection behind the equipment evidence.</span><Link className="text-link" to="/reviews/new">Start Engineering Review <ArrowRight size={14}/></Link></div>
      <div className="overview-grid">
        <section className="panel condition-overview">
          <div className="panel-heading">
            <h2>Equipment status</h2>
            <span className="small-caps">FIXED SNAPSHOT</span>
          </div>
          <div className="status-summary">
            <div
              className="status-donut"
              style={{
                background: `conic-gradient(var(--green) 0 ${normalPercent}%, var(--amber) ${normalPercent}% ${((data.counts.Normal + data.counts.Attention) / data.total) * 100}%, var(--red) ${((data.counts.Normal + data.counts.Attention) / data.total) * 100}% ${((data.total - data.counts.Unknown) / data.total) * 100}%, var(--slate) ${((data.total - data.counts.Unknown) / data.total) * 100}% 100%)`,
              }}
              role="img"
              aria-label={`${normalPercent}% of equipment is Normal`}
            >
              <div>
                <strong>
                  {normalPercent}
                  <small>%</small>
                </strong>
                <span>Normal condition</span>
              </div>
            </div>
            <div className="status-legend">
              {conditions.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    navigate("/assets?condition=" + status);
                  }}
                >
                  <span className={`legend-dot ${status.toLowerCase()}`} />
                  {status}
                  <strong>{data.counts[status]}</strong>
                </button>
              ))}
            </div>
          </div>
          <div className="panel-footnote">
            <ShieldCheck size={15} />
            <span>
              <strong>{attentionCount} assets</strong> require engineering
              follow-up
            </span>
          </div>
        </section>
        <section className="panel system-health">
          <div className="panel-heading">
            <h2>Health by system</h2>
            <span className="panel-subtitle">Normal / total</span>
          </div>
          <div className="system-list">
            {categories.map((cat) => {
              const members = data.evaluated.filter((a) => a.category === cat);
              const normal = members.filter(
                (a) => a.condition === "Normal",
              ).length;
              const Icon = categoryMetadata[cat].icon;
              return (
                <button
                  key={cat}
                  title={cat}
                  onClick={() => {
                    navigate("/assets?system=" + categoryMetadata[cat].slug);
                  }}
                >
                  <span className="system-icon">
                    <Icon size={17} />
                  </span>
                  <div className="system-row-main">
                    <div>
                      <span>{categoryMetadata[cat].label}</span>
                      <strong>
                        {normal}
                        <small> / {members.length}</small>
                      </strong>
                    </div>
                    <div className="system-bar">
                      {conditions.map((status) => {
                        const count = members.filter(
                          (a) => a.condition === status,
                        ).length;
                        return count ? (
                          <span
                            key={status}
                            className={status.toLowerCase()}
                            style={{
                              width: `${(count / members.length) * 100}%`,
                            }}
                          />
                        ) : null;
                      })}
                    </div>
                  </div>
                  <ChevronRight size={14} />
                </button>
              );
            })}
          </div>
          <div className="health-legend">
            <span>
              <i className="normal" />
              Normal
            </span>
            <span>
              <i className="attention" />
              Attention
            </span>
            <span>
              <i className="critical" />
              Critical
            </span>
            <span>
              <i className="unknown" />
              Unknown
            </span>
          </div>
        </section>

        <section className="panel recent-alerts" id="recent-alerts">
          <div className="panel-heading">
            <h2>
              Recent alerts{" "}
              <span className="alert-count">{activeEvents.length}</span>
            </h2>
            <span className="panel-subtitle">Priority first · synthetic</span>
          </div>
          <div className="alert-list">
            {activeEvents.slice(0, 5).map((event) => (
              <AlertRow key={event.id} event={event} />
            ))}
          </div>
          <Link to="/alerts" className="view-alerts">
            View all {activeEvents.length} alerts <ArrowRight size={14} />
          </Link>
        </section>
      </div>
      <section className="panel priority-equipment">
        <div className="inventory-heading">
          <div>
            <h2>
              Engineering follow-up{" "}
              <span className="inventory-count">{priorityAssets.length}</span>
            </h2>
            <p>Priority equipment, maintenance needs and monitoring gaps.</p>
          </div>
          <Link className="text-link" to="/assets">
            View inventory <ArrowRight size={14} />
          </Link>
        </div>
        <div className="priority-list">
          {priorityAssets.slice(0, 4).map((asset) => (
            <button
              key={asset.id}
              className="priority-row"
              onClick={() => openAsset(asset.id)}
              aria-label={"View " + asset.id + " details"}
            >
              <span className="priority-identity">
                <strong className="mono">{asset.id}</strong>
                <span>{asset.name}</span>
                <SimulationBadge assetId={asset.id} />
              </span>
              <StatusBadge condition={asset.condition} />
              <span className="priority-reason">{asset.reasons[0]}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
        <div className="panel-footnote">
          Showing {Math.min(4, priorityAssets.length)} of{" "}
          {priorityAssets.length} assets requiring follow-up. Monitoring gaps do
          not confirm a physical fault.
        </div>
      </section>
    </>
  );
}
