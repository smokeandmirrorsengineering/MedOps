import type { Condition } from "../domain/types";

export function StatusBadge({ condition }: { condition: Condition }) {
  return (
    <span className={`status-badge ${condition.toLowerCase()}`}>
      <span className="status-dot" />
      {condition}
    </span>
  );
}
