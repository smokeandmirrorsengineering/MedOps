import { ArrowRight, Map } from "lucide-react";
import { Link } from "react-router";
import { PageHeading } from "../components/PageHeading";

export function NotFoundPage() {
  return (
    <>
      <PageHeading
        page="Not found"
        title="Page not found"
        description="This address does not match a page in the Evidanor demo."
      />
      <section className="panel empty-state">
        <Map size={30} />
        <h2>Let’s get you back to the overview</h2>
        <p>Use the sidebar to explore Dashboard, Assets or Alerts.</p>
        <Link className="text-link" to="/dashboard">
          Back to Dashboard <ArrowRight size={14} />
        </Link>
      </section>
    </>
  );
}
