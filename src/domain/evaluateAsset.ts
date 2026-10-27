import type { Asset, Condition, Evaluation, Evidence, Reading } from "./types";

export function latestReading(
  readings: readonly Reading[],
  assetId: string,
  pointId: string,
) {
  return readings
    .filter((r) => r.assetId === assetId && r.pointId === pointId)
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0];
}

export function evaluateAsset(
  asset: Asset,
  evidence: Evidence,
  now: string,
): Evaluation {
  const critical: string[] = [],
    attention: string[] = [],
    unknown: string[] = [];
  const points = evidence.points.filter((p) => p.assetId === asset.id);
  const timestamps: string[] = [];
  if (asset.monitoring.connectivity === "Unavailable")
    unknown.push("Monitoring source is unavailable.");
  if (!points.length)
    unknown.push("No monitoring or inspection points are configured.");
  for (const point of points) {
    const reading = latestReading(evidence.readings, asset.id, point.id);
    if (reading) timestamps.push(reading.timestamp);
    if (
      !reading ||
      reading.quality !== "Good" ||
      reading.value === null ||
      !Number.isFinite(reading.value)
    ) {
      unknown.push(
        `${point.label}: ${reading?.quality.toLowerCase() ?? "missing"} data; condition cannot be verified.`,
      );
      continue;
    }
    const age = Date.parse(now) - Date.parse(reading.timestamp);
    if (
      !Number.isFinite(age) ||
      age < 0 ||
      age > asset.monitoring.expectedIntervalMinutes * 60_000
    ) {
      unknown.push(
        `${point.label}: reading is outside the expected reporting window.`,
      );
      continue;
    }
    const { value } = reading;
    const description = `${point.label}: ${value} ${reading.unit}`;
    if (
      (point.criticalAbove !== undefined && value > point.criticalAbove) ||
      (point.criticalBelow !== undefined && value < point.criticalBelow)
    ) {
      critical.push(`${description} — outside the fictional critical limit.`);
    } else if (
      (point.warningAbove !== undefined && value > point.warningAbove) ||
      (point.warningBelow !== undefined && value < point.warningBelow)
    ) {
      attention.push(`${description} — outside the fictional warning limit.`);
    }
  }
  for (const event of evidence.events.filter(
    (e) => e.assetId === asset.id && e.active,
  )) {
    if (event.severity === "Critical") critical.push(event.title);
    if (event.severity === "Attention") attention.push(event.title);
  }
  for (const record of evidence.maintenance.filter(
    (m) => m.assetId === asset.id,
  )) {
    if (record.nextServiceDate < now.slice(0, 10))
      attention.push(
        `Scheduled maintenance was due on ${record.nextServiceDate}.`,
      );
  }
  // Known critical evidence takes priority. Missing evidence must never appear Normal.
  let condition: Condition = "Normal";
  if (critical.length) condition = "Critical";
  else if (unknown.length) condition = "Unknown";
  else if (attention.length) condition = "Attention";
  const reasons = [...critical, ...unknown, ...attention];
  return {
    condition,
    reasons: reasons.length
      ? reasons
      : [
          "All available evidence is within fictional demo limits; maintenance is current.",
        ],
    lastReported:
      timestamps.sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null,
  };
}
