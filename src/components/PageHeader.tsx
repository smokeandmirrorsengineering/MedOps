import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
export function PageHeader({ page, title, description, meta, actions }: {
  page: ReactNode; title: string; description: string; meta?: ReactNode; actions?: ReactNode;
}) {
  return <div className="page-heading">
    <div className="page-header-copy"><div className="breadcrumb">Workspace <ChevronRight size={14} />{page}</div>
      <h1 tabIndex={-1}>{title}</h1><p>{description}</p>{meta && <div className="page-header-meta">{meta}</div>}
    </div>
    {actions && <div className="page-header-actions">{actions}</div>}
  </div>;
}
