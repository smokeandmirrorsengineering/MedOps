import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Bell,
  Box,
  Building2,
  Check,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Map,
  Menu,
  Settings,
  FlaskConical,
  Info,
  Wrench,
  X,
} from "lucide-react";
import { useDemoData } from "../state/DemoDataProvider";
import { useAssetSelection } from "../state/useAssetSelection";
import { AssetDrawer } from "../components/AssetDrawer";
import { BrandMark } from "../components/BrandMark";
const nav = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Assets", icon: Box, path: "/assets" },
  { name: "Facility Map", icon: Map },
  { name: "Engineering Reviews", icon: ClipboardCheck, path: "/reviews" },
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
      )[location.pathname] ??
      (location.pathname.startsWith("/reviews")
        ? "Engineering Reviews"
        : "Page not found");
    document.title = "Evidanor | " + title;
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
      <a className="skip-link" href="#main-content">Skip to main content</a>
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
          aria-label="Evidanor dashboard"
        >
          <BrandMark size={36} />
          <span>
            Evidanor
            <small>ENGINEERING WORKSPACE</small>
          </span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>

        <nav>
          {nav.filter((item) => item.path).map((item) =>
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
        <details className="planned-nav"><summary>Planned modules</summary><div>
          {nav.filter((item) => !item.path).map((item) => <button key={item.name} className="nav-item" disabled><item.icon size={17}/><span>{item.name}</span><small>Planned</small></button>)}
        </div></details>

        <div className="sidebar-bottom">
          <p className="sidebar-positioning">Infrastructure intelligence,<br/>grounded in evidence.</p>
          <div className="profile">
            <span className="avatar">EN</span>
            <div>
              <strong>Engineering team</strong>
              <small>Demo workspace</small>
            </div>
            <small className="sidebar-version">v0.3</small>
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
            <details className="synthetic-indicator"><summary><FlaskConical size={16}/><span>Synthetic Demonstration Data</span><Info size={14}/></summary><p>Fictional equipment, readings and limits for product demonstration. This is a simulated snapshot, not a live connection. Controls never command real equipment. Human review records do not authorize equipment use.</p></details>
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

        <main id="main-content">
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
                <BrandMark size={18} /> Evidanor
              </span>
              <span className="footer-separator">/</span>Infrastructure
              intelligence, grounded in evidence.
            </span>
            <span>
              <Check size={13} />
              Synthetic demonstration · v0.3
            </span>
          </footer>
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
