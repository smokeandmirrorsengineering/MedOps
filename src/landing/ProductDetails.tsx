import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, ClipboardCheck, FileCheck2, History, Radio, Wrench } from "lucide-react";
import { seedCases } from "../service/seed";
import type { CaseEvent } from "../service/types";
import type { PublicPage } from "./destinations";

// Read the deterministic seed, never the visitor's editable workspace records.
const ct = seedCases().cases.find(({ id }) => id === "SC-DEMO-CT-001")!;
const quote = ct.quotations[0];
const approval = ct.approvals[0];
const seedDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(ct.createdAt));

export function HomeOverview() {
  return (
    <section className="landing-section landing-overview" aria-labelledby="overview-title">
      <div className="landing-wrap">
        <div className="landing-section-heading">
          <h2 id="overview-title">Different equipment.<br />Connected engineering work.</h2>
          <p>Bring condition evidence and manually documented service activity into the same engineering workspace.</p>
        </div>
        <div className="landing-examples">
          <article className="landing-example">
            <div className="landing-example-label"><Radio size={18} aria-hidden="true" /> Condition evidence <span>MG-O2-01</span></div>
            <Link className="landing-example-image landing-example-evidence" to="/engineering-workflow" aria-label="See the engineering workflow behind this equipment record">
              <picture>
                <source media="(max-width: 639px)" srcSet="/landing/equipment-reading-mobile.jpg" />
                <img src="/landing/equipment-reading-detail.jpg" width={588} height={308} loading="lazy" alt="Actual oxygen manifold record showing the simulated supply-pressure reading and its evidence quality." />
              </picture>
              <ArrowUpRight className="landing-example-arrow" size={18} aria-hidden="true" />
            </Link>
            <div className="landing-example-copy">
              <h3>From equipment condition<br />to engineering action.</h3>
              <p>Inspect a reading, review its quality and record an engineering assessment. Keep the next action connected to the original evidence.</p>
              <Link className="landing-text-link" to="/engineering-workflow">See the engineering workflow <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
          <article className="landing-example">
            <div className="landing-example-label"><Wrench size={18} aria-hidden="true" /> Service context <span>CT-RAD-01</span></div>
            <Link className="landing-example-image" to="/service-coordination" aria-label="See how the fictional CT service case is organised">
              <picture>
                <source media="(max-width: 639px)" srcSet="/landing/ct-quotation-mobile.jpg" />
                <img src="/landing/ct-quotation-detail.jpg" width={690} height={380} loading="lazy" alt="Actual seeded CT quotation with its recorded amount, review status and pending administrative decision." />
              </picture>
              <ArrowUpRight className="landing-example-arrow" size={18} aria-hidden="true" />
            </Link>
            <div className="landing-example-copy">
              <h3>Keep the service decision<br />with its supporting context.</h3>
              <p>Review coverage, a supplier quotation, responsibility and case history together. CT and MRI service information is recorded manually.</p>
              <Link className="landing-text-link" to="/service-coordination">See the CT service example <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
        </div>
        <div className="landing-overview-foot">
          <p>These previews show the original synthetic demonstration records.</p>
          <Link className="landing-text-link" to="/equipment">Compare equipment coverage <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

export function WorkflowDetails() {
  const boundaries = [
    { icon: FileCheck2, title: "Submitted evidence stays on record", text: "A submitted review retains the equipment evidence and human observations captured at the time. Later scenario changes do not rewrite that report." },
    { icon: ClipboardCheck, title: "Action status is a separate record", text: "A follow-up records ownership, progress and completion notes. Marking an action complete does not clear the equipment condition or close the original exception." },
    { icon: History, title: "Verification begins a new review", text: "Re-verification creates a separate draft linked to the action. The original submitted record remains available alongside the subsequent assessment." },
  ];
  return (
    <section className="landing-section landing-detail-section" aria-labelledby="record-boundaries-title">
      <div className="landing-wrap">
        <div className="landing-section-heading">
          <h2 id="record-boundaries-title">What changes.<br />What stays on record.</h2>
          <p>Current equipment conditions, submitted evidence and follow-up activity serve different purposes.</p>
        </div>
        <div className="landing-record-boundaries">
          {boundaries.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </div>
    </section>
  );
}

export function ServiceDetails() {
  const eventDetail = ({ kind, from, to, text }: CaseEvent) => {
    if (kind === "Quotation added") return `${quote.reference} · ${quote.status}`;
    if (kind === "Approval decision recorded") return `${approval.status} · ${approval.decisionMaker}`;
    if (kind === "Status changed") return `${from} → ${to}`;
    if (kind === "Case created") return `${ct.assetId} · ${ct.responsible}`;
    return text;
  };
  return (
    <section className="landing-section landing-detail-section" aria-labelledby="case-context-title">
      <div className="landing-wrap landing-case-context">
        <div>
          <p className="landing-kicker">Inside the service record</p>
          <h2 id="case-context-title">More than<br />a quotation.</h2>
          <p className="landing-detail-lead">A service case brings the reported issue, the people responsible and the recorded decisions into one history.</p>
          <dl className="landing-context-fields">
            <div><dt>Coverage</dt><dd>Recorded warranty and service-contract dates, with their terms and coverage assumptions.</dd></div>
            <div><dt>Responsibility</dt><dd>An engineering role, a current blocker and a documented next action.</dd></div>
            <div><dt>Decisions</dt><dd>Dated quotation decisions with typed roles. Earlier entries remain in the history.</dd></div>
            <div><dt>Handover</dt><dd>A printable case summary, with the full stored history retained in the case.</dd></div>
          </dl>
        </div>
        <div className="landing-case-history">
          <div className="landing-history-heading"><History size={20} aria-hidden="true" /><div><h3>Seeded CT case history</h3><span>{ct.id} · {seedDate}</span></div></div>
          <ol>
            {ct.events.map((event, index) => <li key={event.id}><span className="landing-history-number" aria-hidden="true">0{index + 1}</span><div><h4>{event.kind}</h4><p>{eventDetail(event)}</p></div></li>)}
          </ol>
          <p className="landing-history-note">Original fictional seed events. Your browser’s saved case may contain subsequent changes. Administrative entries do not establish equipment readiness.</p>
        </div>
      </div>
    </section>
  );
}

export function EquipmentDetails() {
  const rows = [
    ["Condition evidence", "Simulated readings, data quality and evaluated conditions.", "Manually reported availability; no connected equipment readings."],
    ["Investigation context", "Equipment-bound reviews with captured monitoring evidence.", "Service case details and engineering notes; no automated diagnosis."],
    ["Service coordination", "Coverage, cases, quotations and recorded decisions.", "Coverage, cases, quotations and recorded decisions."],
    ["History", "Scenario activity, submitted reviews and separate follow-ups.", "Explicitly recorded service events and quotation decisions."],
  ];
  return (
    <section className="landing-section landing-detail-section" aria-labelledby="coverage-detail-title">
      <div className="landing-wrap">
        <div className="landing-section-heading">
          <h2 id="coverage-detail-title">Know what’s monitored.<br />Know what’s documented.</h2>
          <p>The demonstration has 50 monitored assets and two manually managed imaging records. Service information can be recorded for both.</p>
        </div>
        <div className="landing-coverage-comparison" role="table" aria-label="Equipment coverage comparison">
          <div className="landing-comparison-head" role="row"><span role="columnheader">In the application</span><span role="columnheader">Monitored infrastructure</span><span role="columnheader">Manually managed equipment</span></div>
          {rows.map(([label, monitored, manual]) => <div className="landing-comparison-row" role="row" key={label}><div className="landing-comparison-label" role="rowheader">{label}</div><div role="cell"><span className="landing-mobile-field-label" aria-hidden="true">Monitored infrastructure</span><p>{monitored}</p></div><div role="cell"><span className="landing-mobile-field-label" aria-hidden="true">Manually managed equipment</span><p>{manual}</p></div></div>)}
        </div>
      </div>
    </section>
  );
}

export function DemoDetails() {
  return (
    <section className="landing-section landing-detail-section" aria-labelledby="walkthrough-title">
      <div className="landing-wrap landing-walkthrough">
        <div>
          <p className="landing-kicker">A useful first walkthrough</p>
          <h2 id="walkthrough-title">Follow an issue<br />through the engineering loop.</h2>
          <ol className="landing-walkthrough-steps">
            <li><strong>Inspect the condition.</strong> Start in Needs Attention and open the oxygen manifold to review its simulated pressure and evidence quality.</li>
            <li><strong>Record an assessment.</strong> Start a focused investigation, enter a fictional technician identity and complete the three review items.</li>
            <li><strong>Document the action.</strong> From an exception in the submitted review, create a follow-up and record responsibility and progress.</li>
            <li><strong>Begin a later verification.</strong> A completed action can start a separate re-verification review. Equipment scenarios change separately through Demo Controls.</li>
          </ol>
        </div>
        <aside className="landing-demo-notes" aria-labelledby="demo-workspace-title">
          <ClipboardCheck size={25} strokeWidth={1.5} aria-hidden="true" />
          <h3 id="demo-workspace-title">Your demo workspace</h3>
          <dl>
            <div><dt>Use fictional information</dt><dd>The equipment, readings, organisations and case amounts are synthetic.</dd></div>
            <div><dt>Records stay in this browser</dt><dd>Saved reviews and service entries are browser-local and unauthenticated.</dd></div>
            <div><dt>Return whenever you need</dt><dd>Use Back to website at the top of any workspace page. Returning does not reset your saved demo records.</dd></div>
          </dl>
          <Link className="landing-text-link" to="/engineering-workflow">Read about the record boundaries <ArrowRight size={16} aria-hidden="true" /></Link>
        </aside>
      </div>
    </section>
  );
}

export function RelatedPages({ page }: { page: PublicPage }) {
  const destinations = page === "workflow"
    ? [{ path: "/equipment", title: "Equipment coverage", text: "Understand the two equipment contexts." }, { path: "/service-coordination", title: "Service coordination", text: "Follow the fictional CT service example." }]
    : page === "service"
      ? [{ path: "/equipment", title: "Equipment coverage", text: "See how manual and monitored records differ." }, { path: "/explore-demo", title: "Demo guide", text: "Choose a starting point in the working application." }]
      : page === "equipment"
        ? [{ path: "/engineering-workflow", title: "Engineering workflow", text: "Connect equipment evidence with documented action." }, { path: "/service-coordination", title: "Service coordination", text: "See a manually documented CT scanner case." }]
        : [{ path: "/engineering-workflow", title: "Engineering workflow", text: "Review how evidence and follow-ups are retained." }, { path: "/", title: "Evidanor overview", text: "Return to the public product introduction." }];
  return (
    <section className="landing-related landing-wrap" aria-labelledby="related-title">
      <h2 id="related-title">Keep exploring</h2>
      <div>{destinations.map(({ path, title, text }) => <Link key={path} to={path}><span><strong>{title}</strong><small>{text}</small></span><ArrowRight size={20} aria-hidden="true" /></Link>)}</div>
    </section>
  );
}
