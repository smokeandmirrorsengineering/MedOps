import type { ReactNode } from "react";
import { Clock3 } from "lucide-react";
import { useDemoData } from "../state/DemoDataProvider";
import { date, time } from "../lib/format";
import { PageHeader } from "./PageHeader";

export function PageHeading({
  page,
  title,
  description,
  actions,
}: {
  page: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  const { snapshot } = useDemoData();
  return (
    <PageHeader
      page={page}
      title={title}
      description={description}
      actions={actions}
      meta={
        <>
          <Clock3 size={14} /> Simulated snapshot · {date(snapshot.now)} ·{" "}
          {time(snapshot.now)} BDT (UTC+6)
        </>
      }
    />
  );
}
