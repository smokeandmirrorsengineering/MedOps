import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import {
  Activity,
  AirVent,
  ArrowRight,
  ArrowUpRight,
  ClipboardCheck,
  ListChecks,
  Menu,
  Radio,
  RotateCcw,
  ScanLine,
  Wrench,
  X,
} from "lucide-react";
import { BrandMark } from "../components/BrandMark";
import { registryAsset } from "../service/registry";
import { landingDestinations, publicPages, type PublicPage } from "./destinations";
import { HomeOverview, WorkflowDetails, ServiceDetails, EquipmentDetails, DemoDetails, RelatedPages } from "./ProductDetails";

const workflow = [
  {
    title: "Abnormal condition",
    description: "Review the condition, readings, data quality and alerts for the equipment that needs attention.",
    icon: Activity,
  },
  {
    title: "Investigation",
    description: "Record an engineering assessment alongside the evidence captured at the time of review.",
    icon: ClipboardCheck,
  },
  {
    title: "Documented follow-up",
    description: "Assign responsibility, document the next action and retain a history of progress.",
    icon: ListChecks,
  },
  {
    title: "Re-verification",
    description: "Start a separate review for subsequent verification. The original evidence stays in its submitted record.",
    icon: RotateCcw,
  },
];

const demoPaths = [
  {
    title: "Monitor Equipment",
    description: "Start with the Needs Attention queue. Open an asset to inspect its condition and readings.",
    destination: landingDestinations.dashboard,
    icon: Activity,
    hint: "Engineering dashboard",
  },
  {
    title: "Investigate and Follow Up",
    description: "Start a focused investigation. Create a follow-up from an exception in your submitted review.",
    destination: landingDestinations.investigation,
    icon: ClipboardCheck,
    hint: "Focused equipment investigation",
  },
  {
    title: "Coordinate Service",
    description: "Open the fictional CT scanner case. Review its quotation, recorded decision and service history.",
    destination: landingDestinations.ctCase,
    icon: Wrench,
    hint: "CT scanner service case",
  },
];

function DemoButton() {
  return (
    <Link
      className="landing-button"
      to={landingDestinations.dashboard}
    >
      Explore Live Demo <ArrowUpRight size={17} aria-hidden="true" />
    </Link>
  );
}

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link className="landing-brand" to="/" aria-label="Evidanor home">
      <BrandMark size={footer ? 32 : 30} />
      <span>Evidanor</span>
    </Link>
  );
}

function LandingNavigation({ page }: { page: PublicPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useLayoutEffect(() => setMenuOpen(false), [pathname]);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggle.current?.focus();
      }
      if (event.key !== "Tab") return;
      const controls = [
        toggle.current,
        ...(menu.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []),
      ].filter((control): control is HTMLAnchorElement | HTMLButtonElement =>
        Boolean(control && control.getClientRects().length),
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="landing-navigation">
      <div className="landing-wrap landing-navigation-inner">
        <a className="landing-skip-link" href="#main-content">
          Skip to content
        </a>
        <Brand />
        <nav className="landing-desktop-links" aria-label="Main navigation">
          {publicPages.filter(({ page }) => page !== "home").map(({ path, label }) => (
            <NavLink key={path} to={path} end>{label}</NavLink>
          ))}
        </nav>
        {page !== "home" && page !== "demo" && (
          <Link className="landing-workspace-link" to={landingDestinations.dashboard}>
            Open workspace <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        )}
        <button
          ref={toggle}
          className="landing-menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="landing-mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
        {menuOpen && (
          <div
            className="landing-mobile-navigation"
            id="landing-mobile-navigation"
            ref={menu}
          >
            <nav aria-label="Mobile navigation">
              {publicPages.map(({ path, label }) => (
                <NavLink key={path} to={path} end onClick={closeMenu}>{label}</NavLink>
              ))}
            </nav>
            <p>Synthetic equipment. Working engineering workflows.</p>
          </div>
        )}
      </div>
    </header>
  );
}

function EquipmentLink({ assetId }: { assetId: string }) {
  const asset = registryAsset(assetId)!;
  const Icon = !asset.monitored ? ScanLine : asset.category === "Medical Gas Systems" ? Activity : AirVent;
  return (
    <Link
      className="landing-equipment-row"
      to={asset.monitored ? `/assets?asset=${asset.id}` : `/service/equipment/${asset.id}`}
    >
      <Icon size={21} strokeWidth={1.6} aria-hidden="true" />
      <span>
        <strong>{asset.name}</strong>
        <small>{asset.id} · {asset.department}</small>
      </span>
      <ArrowUpRight size={17} aria-hidden="true" />
    </Link>
  );
}

function HomeHero() {
  return (
    <section className="landing-hero" aria-labelledby="landing-hero-title" data-enter>
          <div className="landing-wrap">
            <div className="landing-hero-copy">
              <p className="landing-eyebrow"><span /> Synthetic product demo</p>
              <h1 id="landing-hero-title">Hospital engineering,<br />in view.</h1>
              <p className="landing-hero-lead">
                Monitor equipment conditions, investigate issues and coordinate service
                in one workspace built for hospital engineering teams.
              </p>
              <div className="landing-hero-actions">
                <DemoButton />
                <Link className="landing-text-link" to="/engineering-workflow">
                  See the engineering workflow <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
              <p className="landing-hero-detail">
                Explore 50 synthetic monitored assets and a fictional CT service case.
              </p>
            </div>
            <Link
              className="landing-product-frame landing-hero-window"
              to={landingDestinations.dashboard}
              aria-label="Open the engineering dashboard shown in this product preview"
            >
              <picture>
                <source media="(max-width: 639px)" srcSet="/landing/dashboard-mobile.jpg" />
                <img
                  src="/landing/dashboard.jpg"
                  alt="Evidanor engineering dashboard showing the synthetic equipment condition totals and Needs Attention queue."
                  width={1440}
                  height={1000}
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
              <span className="landing-preview-action"><ArrowUpRight size={18} /></span>
            </Link>
          </div>
        </section>
  );
}

function WorkflowPage() {
  return (
    <section className="landing-section landing-workflow" id="workflow" aria-labelledby="workflow-title">
          <div className="landing-wrap">
            <div className="landing-section-heading">
              <h1 id="workflow-title">From an equipment issue<br />to a documented next step.</h1>
              <p>Keep the condition, the engineering assessment and the action connected to their evidence.</p>
            </div>
            <div className="landing-workflow-grid">
              <div className="landing-workflow-copy">
                <ol className="landing-workflow-list">
                  {workflow.map(({ title, description, icon: Icon }, index) => (
                    <li key={title}>
                      <div className="landing-workflow-marker" aria-hidden="true"><Icon size={20} /></div>
                      <div>
                        <span className="landing-step-label">Step {index + 1}</span>
                        <h2>{title}</h2>
                        <p>{description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link className="landing-text-link" to={landingDestinations.investigation}>
                  Start an investigation <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
              <Link
                className="landing-product-frame landing-evidence-window"
                to={landingDestinations.evidence}
                aria-label="Inspect MG-O2-01 and its simulated equipment evidence"
              >
                <picture>
                  <source media="(max-width: 639px)" srcSet="/landing/equipment-evidence-phone.jpg" />
                  <img
                    src="/landing/equipment-evidence.jpg"
                    alt="The oxygen supply manifold record with a Critical condition, simulated 2.1 bar pressure reading and data quality."
                    width={640}
                    height={800}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <span className="landing-preview-action"><ArrowUpRight size={18} /></span>
              </Link>
            </div>
          </div>
        </section>
  );
}

function ServicePage() {
  return (
    <section className="landing-section landing-service" id="service" aria-labelledby="service-title">
          <div className="landing-wrap landing-service-grid">
            <div className="landing-service-copy">
              <p className="landing-eyebrow">Service Operations</p>
              <h1 id="service-title">Service decisions,<br />with the full context.</h1>
              <p>
                Follow the fictional CT scanner case through recorded coverage,
                a supplier quotation and a pending administrative decision.
              </p>
              <dl className="landing-case-facts">
                <div><dt>Equipment</dt><dd>CT-RAD-01 · CT Scanner</dd></div>
                <div><dt>Service reference</dt><dd>SC-DEMO-CT-001</dd></div>
                <div><dt>Recorded quotation</dt><dd>DEMO-Q-CT-2026-01</dd></div>
              </dl>
              <Link className="landing-text-link" to={landingDestinations.ctCase}>
                Open the CT service case <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <Link
              className="landing-product-frame landing-service-window"
              to={landingDestinations.ctCase}
              aria-label="Open the fictional CT scanner service case shown in this preview"
            >
              <picture>
                <source media="(max-width: 639px)" srcSet="/landing/ct-quotation-mobile.jpg" />
                <img
                  src="/landing/ct-service-case.jpg"
                  alt="Evidanor's fictional CT scanner service case showing its responsible engineering role, current blocker, expired coverage and recorded quotation."
                  width={1153}
                  height={865}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <span className="landing-preview-action"><ArrowUpRight size={18} /></span>
            </Link>
          </div>
        </section>
  );
}

function EquipmentPage() {
  return (
    <section className="landing-section landing-equipment" id="equipment" aria-labelledby="equipment-title">
          <div className="landing-wrap">
            <div className="landing-section-heading">
              <h1 id="equipment-title">Equipment context<br />for every team.</h1>
              <p>See simulated monitoring evidence alongside manually documented service records.</p>
            </div>
            <div className="landing-equipment-grid">
              <article className="landing-equipment-card">
                <div className="landing-card-icon"><Radio size={23} strokeWidth={1.6} aria-hidden="true" /></div>
                <h2>Monitored infrastructure</h2>
                <p>Review simulated readings, condition indicators and alerts. Open equipment evidence to begin an investigation.</p>
                <EquipmentLink assetId="AHU-OT-01" />
                <EquipmentLink assetId="MG-O2-01" />
              </article>
              <article className="landing-equipment-card">
                <div className="landing-card-icon"><Wrench size={23} strokeWidth={1.6} aria-hidden="true" /></div>
                <h2>Manually managed equipment</h2>
                <p>Document coverage, quotations, service activity and decisions for CT and MRI equipment with no connected telemetry.</p>
                <EquipmentLink assetId="CT-RAD-01" />
                <EquipmentLink assetId="MRI-RAD-01" />
              </article>
            </div>
            <div className="landing-stakeholders">
              <div><h2>Biomedical engineers</h2><p>Equipment records, investigation evidence and a traceable service history.</p></div>
              <div><h2>Facilities managers</h2><p>Abnormal conditions, outstanding actions and the people responsible for follow-up.</p></div>
              <div><h2>Hospital administrators</h2><p>Open engineering issues, pending service decisions and printable summaries.</p></div>
            </div>
          </div>
        </section>
  );
}

function DemoPage() {
  return (
    <section className="landing-section landing-demo" id="demo" aria-labelledby="demo-title">
          <div className="landing-wrap">
            <div className="landing-section-heading">
              <h1 id="demo-title">Choose your route<br />through the demo.</h1>
              <p>Start with an equipment condition, follow an investigation or examine a service decision. Each route opens the working application.</p>
            </div>
            <div className="landing-demo-grid">
              {demoPaths.map(({ title, description, destination, icon: Icon, hint }) => (
                <Link className="landing-demo-card" key={title} to={destination}>
                  <div className="landing-demo-card-top"><Icon size={26} strokeWidth={1.5} aria-hidden="true" /><ArrowUpRight size={19} aria-hidden="true" /></div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                  <span>{hint} <ArrowRight size={15} aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
  );
}

export default function LandingPage({ page = "home" }: { page?: PublicPage }) {
  const main = useRef<HTMLElement>(null);
  const previousPage = useRef(page);
  const { key: locationKey } = useLocation();

  useEffect(() => {
    document.body.classList.add("evidanor-landing-view");
    return () => document.body.classList.remove("evidanor-landing-view");
  }, []);

  useEffect(() => {
    document.title = publicPages.find((entry) => entry.page === page)!.title;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (previousPage.current !== page) main.current?.focus({ preventScroll: true });
    previousPage.current = page;
  }, [page, locationKey]);

  return (
    <div className={"evidanor-landing" + (page === "home" ? "" : " landing-inner-page")} id="top">
      <LandingNavigation page={page} />
      <main className="landing-main" id="main-content" tabIndex={-1} ref={main}>
        {page !== "home" && (
          <nav className="landing-wrap landing-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{publicPages.find((entry) => entry.page === page)!.label}</span>
          </nav>
        )}
        {page === "home" && <><HomeHero /><HomeOverview /></>}
        {page === "workflow" && <><WorkflowPage /><WorkflowDetails /></>}
        {page === "service" && <><ServicePage /><ServiceDetails /></>}
        {page === "equipment" && <><EquipmentPage /><EquipmentDetails /></>}
        {page === "demo" && <><DemoPage /><DemoDetails /></>}
        {page !== "home" && <RelatedPages page={page} />}
      </main>
      <footer className="landing-footer">
        <div className="landing-wrap">
          <div className="landing-footer-bottom">
            <div><Brand footer /><p>Infrastructure intelligence, grounded in evidence.</p></div>
            <p className="landing-disclosure">
              Synthetic demonstration. Equipment readings, organisations, quotations
              and service records are fictional. Monitoring is simulated. Records
              entered in the demo are stored in your browser.
            </p>
          </div>
          <div className="landing-footer-legal">
            <span>© {new Date().getFullYear()} Evidanor</span>
            <nav aria-label="Footer navigation">
              {publicPages.map(({ path, label }) => <NavLink key={path} to={path} end>{label}</NavLink>)}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
