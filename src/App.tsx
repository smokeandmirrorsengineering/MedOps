import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  Box,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Gauge,
  LayoutDashboard,
  Map,
  Menu,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Stethoscope,
  TriangleAlert,
  Wind,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { mockDataProvider } from "./data/provider";
import { buildDashboard, filterAssets } from "./domain/selectors";
import { categories } from "./domain/types";
import type { Category, Condition } from "./domain/types";
import { StatusBadge } from "./components/StatusBadge";
import { AssetDrawer } from "./components/AssetDrawer";
import { date, time } from "./lib/format";

const snapshot = mockDataProvider.getSnapshot();
const dashboard = buildDashboard(snapshot);
const categoryLabels = [
  "HVAC & theatre",
  "Medical gas",
  "Cold storage",
  "Electrical & power",
  "Laboratory",
];
const categoryIcons: LucideIcon[] = [Wind, Gauge, Snowflake, Zap, Stethoscope];
const conditions: Condition[] = ["Normal", "Attention", "Critical", "Unknown"];
const nav = [
  { name: "Dashboard", icon: LayoutDashboard, available: true },
  { name: "Assets", icon: Box, available: true },
  { name: "Facility Map", icon: Map },
  { name: "Prechecks", icon: ClipboardCheck },
  { name: "Maintenance", icon: Wrench },
  { name: "Documents", icon: FileText },
  { name: "Alerts", icon: Bell, available: true },
  { name: "Settings", icon: Settings },
];
const pageSize = 8;
export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [condition, setCondition] = useState<Condition | "">("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [alertExpanded, setAlertExpanded] = useState(false);
  const navigationPanel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!mobileNav) return;
    const previous = document.activeElement as HTMLElement | null;
    navigationPanel.current
      ?.querySelector<HTMLElement>("a, button:not(:disabled)")
      ?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileNav(false);
      if (event.key === "Tab") {
        const controls = navigationPanel.current?.querySelectorAll<HTMLElement>(
          "a, button:not(:disabled)",
        );
        if (!controls?.length) return;
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, [mobileNav]);
  const closeDrawer = useCallback(() => setSelectedId(null), []);
  const selected = dashboard.evaluated.find((a) => a.id === selectedId);
  const filtered = useMemo(
    () => filterAssets(dashboard.evaluated, query, category, condition),
    [query, category, condition],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const activeEvents = snapshot.events
    .filter((e) => e.active)
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  const normalPercent = Math.round(
    (dashboard.counts.Normal / dashboard.total) * 100,
  );
  const attentionCount = dashboard.counts.Attention + dashboard.counts.Critical;
  function navigate(name: string) {
    setActiveNav(name);
    setMobileNav(false);
    if (name === "Alerts") setAlertExpanded(true);
    requestAnimationFrame(() =>
      document
        .getElementById(
          name === "Assets"
            ? "asset-inventory"
            : name === "Alerts"
              ? "recent-alerts"
              : "dashboard-top",
        )
        ?.scrollIntoView({ block: "start" }),
    );
  }
  function applyCondition(value: Condition | "") {
    setCondition(value);
    setPage(1);
  }
  function clearFilters() {
    setQuery("");
    setCategory("");
    setCondition("");
    setPage(1);
  }
  return (
    <div className="app-shell" id="dashboard-top">
      {mobileNav && (
        <div className="sidebar-scrim" onClick={() => setMobileNav(false)} />
      )}
      <aside
        ref={navigationPanel}
        className={`sidebar ${mobileNav ? "is-open" : ""}`}
        aria-label="Main navigation"
        role={mobileNav ? "dialog" : undefined}
        aria-modal={mobileNav ? true : undefined}
      >
        <button
          className="icon-button mobile-nav-close"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
        <a
          className="brand"
          href="#dashboard-top"
          onClick={() => navigate("Dashboard")}
          aria-label="MedOps dashboard"
        >
          <span className="brand-icon">
            <Activity size={25} strokeWidth={2.5} />
          </span>
          <span>
            Med<span className="brand-light">Ops</span>
            <small>ENGINEERING INTELLIGENCE</small>
          </span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {nav.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activeNav === item.name ? "active" : ""}`}
              disabled={!item.available}
              onClick={() => navigate(item.name)}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
              {!item.available ? (
                <small>Coming soon</small>
              ) : item.name === "Alerts" ? (
                <span className="nav-count">{activeEvents.length}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="foundation-card">
            <span>
              <ShieldCheck size={17} /> BUILT FOR CONTINUITY
            </span>
            <p>
              Prevent failures before
              <br />
              they interrupt care.
            </p>
            <small>v0.1A · Foundation + Dashboard</small>
          </div>
          <div className="profile">
            <span className="avatar">EN</span>
            <div>
              <strong>Engineering team</strong>
              <small>Demo workspace</small>
            </div>
            <span className="profile-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="hospital">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <span className="hospital-icon">
              <Building2 size={20} />
            </span>
            <div>
              <strong>MedOps Demo Hospital</strong>
              <span>
                Dhaka, Bangladesh <span className="separator">/</span> 250 beds
              </span>
            </div>
          </div>
          <div className="topbar-right">
            <span className="simulation-badge">
              <span />
              SIMULATION MODE
            </span>
            <span className="topbar-divider" />
            <button
              className="notification-button"
              onClick={() => navigate("Alerts")}
              aria-label={`View ${activeEvents.length} synthetic alerts`}
            >
              <Bell size={20} />
              <i />
            </button>
            <span className="avatar light-avatar">EN</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="breadcrumb">
                Workspace <ChevronRight size={12} /> Dashboard
              </div>
              <h1>
                Engineering overview<span className="title-dot">.</span>
              </h1>
              <p>A clear view of the systems that keep care moving.</p>
            </div>
            <div className="date-card">
              <CalendarDays size={17} />
              <div>
                <strong>{date(snapshot.now)}</strong>
                <span>Simulated snapshot · {time(snapshot.now)} BST</span>
              </div>
            </div>
          </div>
          <div className="demo-banner">
            <span className="demo-banner-icon">
              <Radio size={16} />
            </span>
            <p>
              <strong>Your hospital, in view.</strong> You’re exploring a
              fictional facility with synthetic equipment data.
            </p>
            <span className="demo-label">DEMO ENVIRONMENT</span>
          </div>
          <section className="kpi-grid" aria-label="Equipment condition totals">
            {(
              [
                {
                  label: "Total assets",
                  value: dashboard.total,
                  icon: Box,
                  tone: "total",
                  note: `Across ${categories.length} engineering systems`,
                  filter: "",
                },
                {
                  label: "Normal",
                  value: dashboard.counts.Normal,
                  icon: CheckCheck,
                  tone: "normal",
                  note: "Within demo condition limits",
                  filter: "Normal",
                },
                {
                  label: "Attention",
                  value: dashboard.counts.Attention,
                  icon: CircleAlert,
                  tone: "attention",
                  note: "Review or service required",
                  filter: "Attention",
                },
                {
                  label: "Critical",
                  value: dashboard.counts.Critical,
                  icon: TriangleAlert,
                  tone: "critical",
                  note: "Priority engineering review",
                  filter: "Critical",
                },
                {
                  label: "Unknown",
                  value: dashboard.counts.Unknown,
                  icon: CircleHelp,
                  tone: "unknown",
                  note: "Monitoring data unavailable",
                  filter: "Unknown",
                },
              ] as const
            ).map((kpi) => (
              <button
                key={kpi.label}
                className={`kpi-card ${kpi.tone} ${condition === kpi.filter && condition ? "selected-kpi" : ""}`}
                onClick={() => {
                  applyCondition(kpi.filter);
                  navigate("Assets");
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
                    background: `conic-gradient(var(--green) 0 ${normalPercent}%, var(--amber) ${normalPercent}% ${((dashboard.counts.Normal + dashboard.counts.Attention) / dashboard.total) * 100}%, var(--red) ${((dashboard.counts.Normal + dashboard.counts.Attention) / dashboard.total) * 100}% ${((dashboard.total - dashboard.counts.Unknown) / dashboard.total) * 100}%, var(--slate) ${((dashboard.total - dashboard.counts.Unknown) / dashboard.total) * 100}% 100%)`,
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
                        applyCondition(status);
                        navigate("Assets");
                      }}
                    >
                      <span className={`legend-dot ${status.toLowerCase()}`} />
                      {status}
                      <strong>{dashboard.counts[status]}</strong>
                    </button>
                  ))}
                </div>
              </div>
              <div className="panel-footnote">
                <ShieldCheck size={15} />
                <span>
                  <strong>{attentionCount} assets</strong> need engineering
                  review
                </span>
              </div>
            </section>
            <section className="panel system-health">
              <div className="panel-heading">
                <h2>Health by system</h2>
                <span className="panel-subtitle">Normal / total</span>
              </div>
              <div className="system-list">
                {categories.map((cat, index) => {
                  const members = dashboard.evaluated.filter(
                    (a) => a.category === cat,
                  );
                  const normal = members.filter(
                    (a) => a.condition === "Normal",
                  ).length;
                  const Icon = categoryIcons[index];
                  return (
                    <button
                      key={cat}
                      title={cat}
                      onClick={() => {
                        setCategory(cat);
                        setPage(1);
                        navigate("Assets");
                      }}
                    >
                      <span className="system-icon">
                        <Icon size={17} />
                      </span>
                      <div className="system-row-main">
                        <div>
                          <span>{categoryLabels[index]}</span>
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
                <span className="panel-subtitle">Synthetic events</span>
              </div>
              <div className="alert-list">
                {activeEvents
                  .slice(0, alertExpanded ? activeEvents.length : 3)
                  .map((event) => (
                    <button
                      className="alert-row"
                      key={event.id}
                      onClick={() => setSelectedId(event.assetId)}
                    >
                      <span
                        className={`alert-icon ${event.severity.toLowerCase()}`}
                      >
                        {event.severity === "Critical" ? (
                          <TriangleAlert size={16} />
                        ) : event.severity === "Info" ? (
                          <Radio size={16} />
                        ) : (
                          <CircleAlert size={16} />
                        )}
                      </span>
                      <span className="alert-copy">
                        <strong>{event.title}</strong>
                        <span>
                          <b className="mono">{event.assetId}</b>
                          <i />
                          {time(event.timestamp)} BST
                        </span>
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
              </div>
              <button
                className="view-alerts"
                onClick={() => setAlertExpanded(!alertExpanded)}
              >
                {alertExpanded
                  ? "Show latest alerts"
                  : `View all ${activeEvents.length} alerts`}
                <ArrowRight size={14} />
              </button>
            </section>
          </div>
          <section className="panel inventory" id="asset-inventory">
            <div className="inventory-heading">
              <div>
                <h2>
                  Asset inventory{" "}
                  <span className="inventory-count">{dashboard.total}</span>
                </h2>
                <p>Your equipment register, connected to its condition.</p>
              </div>
              <span className="read-only-label">
                <ShieldCheck size={14} />
                Read-only demo
              </span>
            </div>
            <div className="filters">
              <label className="search-box">
                <Search size={17} />
                <input
                  aria-label="Search assets"
                  placeholder="Search asset ID or equipment name..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
                {query && (
                  <button
                    className="clear-search"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      setPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
              <div className="filter-select">
                <SlidersHorizontal size={15} />
                <select
                  aria-label="Filter by category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as Category | "");
                    setPage(1);
                  }}
                >
                  <option value="">All systems</option>
                  {categories.map((c, i) => (
                    <option key={c} value={c}>
                      {categoryLabels[i]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} />
              </div>
              <div className="filter-select condition-select">
                <span className="filter-dot" />
                <select
                  aria-label="Filter by condition"
                  value={condition}
                  onChange={(e) =>
                    applyCondition(e.target.value as Condition | "")
                  }
                >
                  <option value="">All conditions</option>
                  {conditions.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={13} />
              </div>
              {(query || category || condition) && (
                <button className="reset-filters" onClick={clearFilters}>
                  Reset
                </button>
              )}
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">ASSET / EQUIPMENT</th>
                    <th scope="col">SYSTEM</th>
                    <th scope="col">LOCATION</th>
                    <th scope="col">CONDITION</th>
                    <th scope="col">OPERATING STATE</th>
                    <th scope="col">
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((asset) => {
                    const categoryIndex = categories.indexOf(asset.category),
                      Icon = categoryIcons[categoryIndex];
                    const location = snapshot.locations.find(
                      (l) => l.id === asset.locationId,
                    )!;
                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedId(asset.id)}
                      >
                        <td>
                          <div className="asset-cell">
                            <span className="table-asset-icon">
                              <Icon size={18} />
                            </span>
                            <div>
                              <button
                                className="asset-link mono"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(asset.id);
                                }}
                              >
                                {asset.id}
                              </button>
                              <span>{asset.name}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-cell">
                            {categoryLabels[categoryIndex]}
                          </span>
                        </td>
                        <td>
                          <div className="location-cell">
                            <span>{location.department}</span>
                            <small>
                              {location.floor} · {location.room}
                            </small>
                          </div>
                        </td>
                        <td>
                          <StatusBadge condition={asset.condition} />
                        </td>
                        <td>
                          <span className="operating">
                            <span
                              className={
                                asset.operatingState === "Running"
                                  ? "running-dot"
                                  : "muted-dot"
                              }
                            />
                            {asset.operatingState}
                          </span>
                        </td>
                        <td>
                          <button
                            className="row-open"
                            aria-label={`View ${asset.id} details`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(asset.id);
                            }}
                          >
                            <ChevronRight size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="empty-state">
                <Search size={28} />
                <h3>No matching equipment</h3>
                <p>Try a different asset ID, name, or filter.</p>
                <button onClick={clearFilters}>Clear all filters</button>
              </div>
            )}
            <div className="table-footer">
              <span aria-live="polite">
                Showing{" "}
                <strong>
                  {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                  {Math.min(currentPage * pageSize, filtered.length)}
                </strong>{" "}
                of <strong>{filtered.length}</strong> assets
                {filtered.length !== dashboard.total &&
                  ` (${dashboard.total} total)`}
              </span>
              <div className="pagination">
                <button
                  aria-label="Previous page"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    aria-label={`Page ${n}`}
                    aria-current={currentPage === n ? "page" : undefined}
                    className={currentPage === n ? "current-page" : ""}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  aria-label="Next page"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === pages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
          <footer className="page-footer">
            <span>
              <span className="footer-logo">
                <Activity size={14} /> MedOps
              </span>
              <span className="footer-separator">/</span>Infrastructure
              intelligence. Care continuity.
            </span>
            <span>
              <Check size={13} />
              All data is synthetic · v0.1A
            </span>
          </footer>
          <p className="safety-note">
            <BookOpen size={13} />
            Demonstration only. Readings and condition limits are fictional and
            must not be used for clinical or engineering decisions.
          </p>
        </main>
      </div>
      {selected && (
        <AssetDrawer
          asset={selected}
          snapshot={snapshot}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
}
