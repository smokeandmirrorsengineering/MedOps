// Non-empty placeholders are still missing follow-up information.
export function hasFollowUpText(value: string): boolean {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[.\s/_–—-]+/g, " ")
    .trim();
  return (
    !!normalized &&
    ![
      "n a",
      "na",
      "none",
      "nil",
      "not applicable",
      "unassigned",
      "not assigned",
      "not specified",
      "tbd",
      "to be determined",
      "todo",
    ].includes(normalized)
  );
}

export const responsibleLabel = (value: string) =>
  hasFollowUpText(value) ? value : "Unassigned";
export const followUpLabel = (value: string) =>
  hasFollowUpText(value) ? value : "Not specified";
