import type { Condition } from "../domain/types";
import {
  CircleCheck,
  CircleHelp,
  CircleAlert,
  TriangleAlert,
} from "lucide-react";
export const conditionIcons = {
  Normal: CircleCheck,
  Attention: CircleAlert,
  Critical: TriangleAlert,
  Unknown: CircleHelp,
};

export function StatusBadge({ condition }: { condition: Condition }) {
  const Icon = conditionIcons[condition];
  return (
    <span className={`status-badge ${condition.toLowerCase()}`}>
      <Icon size={14} aria-hidden="true" />
      {condition}
    </span>
  );
}
