import { CalendarDays, ChevronRight } from "lucide-react";
import { useDemoData } from "../state/DemoDataProvider";
import { date, time } from "../lib/format";

export function PageHeading({
  page,
  title,
  description,
}: {
  page: string;
  title: string;
  description: string;
}) {
  const { snapshot } = useDemoData();
  return (
    <div className="page-heading">
      <div>
        <div className="breadcrumb">
          Workspace <ChevronRight size={12} />
          {page}
        </div>
        <h1>
          {title}
          <span className="title-dot">.</span>
        </h1>
        <p>{description}</p>
      </div>
      <div className="date-card">
        <CalendarDays size={17} />
        <div>
          <strong>{date(snapshot.now)}</strong>
          <span>Simulated snapshot · {time(snapshot.now)} BDT</span>
        </div>
      </div>
    </div>
  );
}
