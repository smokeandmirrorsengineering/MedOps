import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Activity,
  Bell,
  BookOpen,
  Box,
  Building2,
  Check,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Map,
  Menu,
  Settings,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { useDemoData } from "../state/DemoDataProvider";
import { useAssetSelection } from "../state/useAssetSelection";
import { AssetDrawer } from "../components/AssetDrawer";
const nav = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Assets", icon: Box, path: "/assets" },
  { name: "Facility Map", icon: Map },
  { name: "Prechecks", icon: ClipboardCheck },
  { name: "Maintenance", icon: Wrench },
  { name: "Documents", icon: FileText },
  { name: "Alerts", icon: Bell, path: "/alerts" },
  { name: "Settings", icon: Settings },
];
export function AppLayout() {
  const { snapshot, activeEvents, getAsset } = useDemoData();
  const { assetId, closeAsset } = useAssetSelection();
  const selected = assetId ? getAsset(assetId) : undefined;
  const [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();
  const routeNavigate = useNavigate();
  function navigate(name: string) {
    setMobileNav(false);
    routeNavigate(name === "Alerts" ? "/alerts" : "/dashboard");
  }
  useEffect(() => {
    window.scrollTo(0, 0);
    const title =
      (
        {
          "/dashboard": "Dashboard",
          "/assets": "Assets",
          "/alerts": "Alerts",
        } as Record<string, string>
      )[location.pathname] ?? "Page not found";
    document.title = "MedOps | " + title;
  }, [location.pathname]);
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
        <Link
          className="brand"
          to="/dashboard"
          onClick={() => setMobileNav(false)}
          aria-label="MedOps dashboard"
        >
          <span className="brand-icon">
            <Activity size={25} strokeWidth={2.5} />
          </span>
          <span>
            Med<span className="brand-light">Ops</span>
            <small>ENGINEERING INTELLIGENCE</small>
          </span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>

        <nav>
          {nav.map((item) =>
            item.path ? (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileNav(false)}
                className={({ isActive }) =>
                  "nav-item" + (isActive ? " active" : "")
                }
              >
                <item.icon size={18} />
                <span>{item.name}</span>
                {item.name === "Alerts" && (
                  <span className="nav-count">{activeEvents.length}</span>
                )}
              </NavLink>
            ) : (
              <button key={item.name} className="nav-item" disabled>
                <item.icon size={18} />
                <span>{item.name}</span>
                <small>Coming soon</small>
              </button>
            ),
          )}
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
            <small>v0.1B · Multi-page workspace</small>
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
              aria-expanded={mobileNav}
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
          {assetId && !selected && (
            <div className="invalid-asset-notice" role="alert">
              <span>
                Equipment “{assetId.slice(0, 80)}” was not found in this demo
                register.
              </span>
              <button onClick={closeAsset}>Dismiss</button>
            </div>
          )}
          <Outlet />
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
              All data is synthetic · v0.1B
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
          onClose={closeAsset}
        />
      )}
    </div>
  );
}
