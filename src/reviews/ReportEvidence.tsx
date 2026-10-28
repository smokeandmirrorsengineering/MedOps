import { recordTime } from "./ReviewComponents";
import type { EvidenceSnapshot } from "./types";

/** Compact print layout; every value comes from the frozen response snapshot. */
export function ReportEvidence({ evidence }: { evidence: EvidenceSnapshot }) {
  return (
    <div className="report-compact-evidence">
      <p className="compact-evidence-clocks">
        <b>SYNTHETIC EVIDENCE</b> · Monitoring{" "}
        {recordTime(evidence.simulatedAt)} · Actual capture{" "}
        {recordTime(evidence.capturedAt)}
      </p>
      {!evidence.assets.length && !evidence.issues.length && (
        <p>
          No automatic monitoring evidence is linked. Human verification is
          recorded separately.
        </p>
      )}
      {evidence.assets.map((asset) => (
        <section className="compact-evidence-asset" key={asset.id}>
          <h4>
            {asset.id} · {asset.name} <span>{asset.condition} at capture</span>
          </h4>
          <p>{asset.location}</p>
          <p>
            <b>State:</b> {asset.operatingState} · <b>Connection:</b>{" "}
            {asset.connectivity} · <b>Method:</b> {asset.method} ·{" "}
            <b>Source:</b> {asset.source}
          </p>
          <table>
            <thead>
              <tr>
                <th>Monitoring point</th>
                <th>Value</th>
                <th>Quality / validity</th>
                <th>Reported (BDT, UTC+6)</th>
              </tr>
            </thead>
            <tbody>
              {asset.readings.map((reading) => (
                <tr key={reading.pointId}>
                  <th scope="row">
                    {reading.label}
                    <small>{reading.pointId}</small>
                  </th>
                  <td>
                    {reading.value ?? "—"} {reading.unit}
                  </td>
                  <td>
                    {reading.quality} ·{" "}
                    {reading.validity === "Current simulated"
                      ? "Valid at capture (synthetic)"
                      : reading.validity}
                  </td>
                  <td>{recordTime(reading.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            <b>Evaluated evidence:</b>{" "}
            {asset.reasons.join(" ") || "None recorded"}
          </p>
          {asset.alarms.map((alarm) => (
            <p key={alarm.id}>
              <b>Active alarm:</b> {alarm.severity} · {alarm.title} ·{" "}
              {recordTime(alarm.timestamp)} · {alarm.id}
            </p>
          ))}
          {asset.maintenance.map((record, index) => (
            <p key={index}>
              <b>Maintenance:</b> Last service {record.lastServiceDate}; next{" "}
              {record.nextServiceDate}. {record.summary}
            </p>
          ))}
        </section>
      ))}
      {evidence.issues.map((issue) => (
        <section className="compact-carried-issue" key={issue.key}>
          <h4>
            {issue.title} · {issue.assetId ?? "Scope issue"} · {issue.source}
          </h4>
          <p>{issue.observation}</p>
          {issue.reviewId && <p>Originating review: {issue.reviewId}</p>}
        </section>
      ))}
    </div>
  );
}
