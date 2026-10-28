import { choices, methods } from "./types";
import type { ReviewTemplate, TemplateItem } from "./types";

export const scopeAssetIds = [
  "AHU-OT-01",
  "AHU-OT-02",
  "AHU-OT-03",
  "EF-OT-01",
  "MG-AVSU-01",
  "UPS-02",
];
const ahus = scopeAssetIds.slice(0, 3);
function item(
  id: string,
  order: number,
  title: string,
  prompt: string,
  kind: TemplateItem["kind"],
  assetIds: string[],
  pointLabels: string[],
  limitation: string,
): TemplateItem {
  return {
    id,
    order,
    title,
    prompt,
    kind,
    assetIds,
    pointLabels,
    limitation,
    humanOnly: kind === "human",
    section:
      order < 4
        ? "Air handling & environment"
        : order < 7
          ? "Gas & electrical infrastructure"
          : "Monitoring & continuity",
    allowedResponses: [...choices],
    allowedMethods: [...methods],
    rules: {
      observationOnAbnormal: true,
      reconcilePassConflict: true,
      tolerances: {
        "°C": 0.2,
        Pa: 5,
        "m³/h": 50,
        A: 0.2,
        V: 2,
        "%": 1,
        "/ 100": 1,
      },
    },
  };
}
export const otTemplate: ReviewTemplate = {
  id: "ot-engineering-review",
  version: "1.0",
  title: "Operating Theatre — Engineering Review",
  scopeId: "ot-shared-services",
  scope:
    "Main clinical building · Level 3 · Operating theatres · OT plant room (shared engineering area)",
  scopeAssetIds: [...scopeAssetIds],
  disclaimer:
    "Synthetic demonstration inspection prompts, not approved hospital procedures. Individual Pass responses are the technician's recorded assessments, not a MedOps safety determination. Typed names are unverified and are not signatures.",
  items: [
    item(
      "ahu-operation",
      1,
      "Air-handling condition and operation",
      "Inspect the associated AHU and extract-fan indications. Record what you personally verified against your facility's criteria.",
      "equipment",
      [...ahus, "EF-OT-01"],
      [],
      "Common OT engineering-area association only; no individual-theatre service relationship. Extract fan has only a supply-temperature tag, not fan-performance proof.",
    ),
    item(
      "environment",
      2,
      "Available environmental monitoring",
      "Review supply-air temperatures and their quality. Record the limits of the evidence you could verify.",
      "equipment",
      [...ahus],
      ["Supply temperature"],
      "No room temperature, humidity, particles or theatre pressure monitoring exists in this seed. Supply-air temperature does not establish room conditions.",
    ),
    item(
      "physical-filter",
      3,
      "Physical filter and pressure-indicator observations",
      "Record a physical filter/local-indicator observation, or explain why this inspection could not be performed.",
      "human",
      [],
      [],
      "No physical inspection is inferred from telemetry. No automatic monitoring evidence is linked to this human observation.",
    ),
    item(
      "gas-indications",
      4,
      "Medical-gas alarm indications",
      "Inspect local medical-gas alarm indications relevant to this shared OT engineering area; record access or evidence limitations.",
      "human",
      [],
      [],
      "MG-AVSU-01 is located here but has only an inspection score, not alarm-state telemetry. Plant oxygen pressure is not linked to an individual theatre.",
    ),
    item(
      "ups-indicators",
      5,
      "UPS / backup supply indicators",
      "Inspect UPS-02 local indicators and record your observations alongside the available synthetic evidence.",
      "equipment",
      ["UPS-02"],
      [],
      "UPS-02 name and location support this shared area only; no individual theatre circuit association is defined.",
    ),
    item(
      "power-documents",
      6,
      "Backup-power service / test documentation",
      "Record whether you sighted relevant local service or test documentation. Explain missing records or inaccessible panels.",
      "human",
      [],
      [],
      "Seed manuals/drawings are placeholders. Routine service metadata is not a backup-power test certificate.",
    ),
    item(
      "monitoring-gaps",
      7,
      "Monitoring availability and data gaps",
      "Review every affected in-scope asset individually. Record a verification or exception for each unavailable, Unknown or stale source.",
      "gaps",
      [...scopeAssetIds],
      [],
      "Only the six assets in this shared OT area are considered. Inspection-based monitoring is identified separately.",
    ),
    item(
      "carried-issues",
      8,
      "Previously unresolved engineering issues",
      "Acknowledge that each listed issue was reviewed, and record your assessment. Acknowledgement does not resolve it.",
      "issues",
      [],
      [],
      "Includes open exceptions from submitted reviews of this same scope and active synthetic alarms on scoped equipment only.",
    ),
    item(
      "general-notes",
      9,
      "General observations and shift-handover notes",
      "Record general engineering observations or communication needs for follow-up. This is not a formal shift-handover sign-off.",
      "human",
      [],
      [],
      "No automatic monitoring evidence is linked. Do not record patient information in this demonstration.",
    ),
  ],
};
