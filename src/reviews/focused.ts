import type { Snapshot } from "../domain/types";
import { choices, methods, type ReviewTemplate } from "./types";
import { otTemplate } from "./template";
export const FOCUSED_TEMPLATE_ID = "focused-equipment-investigation";
export const focusedItems = [
  {
    id: "equipment-evidence",
    title: "Review Equipment Evidence",
    section: "Equipment evidence",
    prompt:
      "Review this asset's current derived condition, existing readings, quality, active alarms and timestamps. Record the available evidence and its limitations.",
  },
  {
    id: "independent-verification",
    title: "Independent Engineering Verification",
    section: "Independent verification",
    prompt:
      "Record what you independently checked, the verification method and observations. Explain any difference between your assessment and Critical or Unknown monitoring evidence. Telemetry alone does not prove a physical inspection.",
  },
  {
    id: "findings-follow-up",
    title: "Findings and Follow-Up",
    section: "Findings & follow-up",
    prompt:
      "Document unresolved findings, discrepancies, the responsible engineering role and proposed investigative or corrective action. A human response cannot clear equipment evidence or close an exception.",
  },
];
export function focusedTemplate(
  snapshot: Snapshot,
  assetId: string,
): ReviewTemplate {
  const asset = snapshot.assets.find((asset) => asset.id === assetId);
  if (!asset)
    throw Error("Select an existing equipment asset for the investigation.");
  const location = snapshot.locations.find(
    (location) => location.id === asset.locationId,
  )!;
  return {
    id: FOCUSED_TEMPLATE_ID,
    version: "1.0",
    title: "Focused Equipment Investigation",
    scopeId: `asset:${asset.id}`,
    scope: `${asset.id} · ${asset.name} · ${location.building} · ${location.floor} · ${location.department} · ${location.room}`,
    scopeAssetIds: [asset.id],
    disclaimer:
      "Synthetic equipment investigation, not an approved operating procedure. Human assessments do not authorize equipment use. Typed identities are unverified and are not signatures.",
    items: focusedItems.map((item, index) => ({
      ...item,
      order: index + 1,
      kind: "equipment",
      assetIds: [asset.id],
      pointLabels: [],
      humanOnly: false,
      limitation:
        "This record concerns only the selected asset. All monitoring evidence is synthetic; independent physical verification must be recorded explicitly.",
      allowedResponses: [...choices],
      allowedMethods: [...methods],
      rules: structuredClone(otTemplate.items[0].rules),
    })),
  };
}
