import { useState } from "react";
import { FlaskConical, RotateCcw } from "lucide-react";
import { useDemoData } from "../state/DemoDataProvider";
import {
  CONNECTION_ASSET_IDS,
  FAULT_ASSET_ID,
  isConnectionAsset,
} from "../simulation/types";
import type { ConnectionAssetId } from "../simulation/types";

export function ScenarioActions({
  assetId,
  mode = "all",
}: {
  assetId: string;
  mode?: "fault" | "connection" | "all";
}) {
  const { simulation, dispatch } = useDemoData();
  const disconnected =
    isConnectionAsset(assetId) && !!simulation.connections[assetId];
  return (
    <div className="demo-action-buttons">
      {assetId === FAULT_ASSET_ID && mode !== "connection" && (
        <button
          className={`demo-button ${simulation.fault ? "quiet" : "fault-action"}`}
          disabled={!simulation.fault && !!disconnected}
          onClick={() =>
            dispatch({
              type: simulation.fault ? "CLEAR_FAULT" : "ACTIVATE_FAULT",
            })
          }
        >
          {simulation.fault ? "Clear Fault" : "Simulate Fault"}
        </button>
      )}
      {isConnectionAsset(assetId) && mode !== "fault" && (
        <button
          className="demo-button"
          onClick={() =>
            dispatch({
              type: disconnected ? "RESTORE_CONNECTION" : "LOSE_CONNECTION",
              assetId,
            })
          }
        >
          {disconnected ? "Restore Connection" : "Simulate Connection Loss"}
        </button>
      )}
    </div>
  );
}
export function SimulationBadge({ assetId }: { assetId: string }) {
  const { getAssetSimulation } = useDemoData();
  const state = getAssetSimulation(assetId);
  if (!state.faultActive && !state.connectionLost) return null;
  return (
    <span className="simulation-tag">
      {state.faultActive
        ? state.connectionLost
          ? "Fault active · monitoring lost"
          : "Simulated fault active"
        : "Connection loss active"}
    </span>
  );
}
export function DemoControls() {
  const { simulation, dispatch, persistence } = useDemoData();
  const [connectionTarget, setConnectionTarget] =
    useState<ConnectionAssetId>("FRG-BB-01");
  const lastEvent = simulation.history.at(-1);
  const confirmation =
    simulation.lastAction === "RESET"
      ? "Demo reset. Original equipment evidence, connectivity and seed alerts restored."
      : lastEvent
        ? `${lastEvent.title} — ${lastEvent.assetId}.`
        : "Baseline ready. All controls change synthetic evidence only.";
  return (
    <section className="panel demo-controls" aria-label="Demo Controls">
      <div className="inventory-heading">
        <div>
          <h2>
            <FlaskConical size={17} />
            Demo Controls <span className="section-tag">SIMULATION ONLY</span>
          </h2>
          <p>
            Evidence changes for this browser demo. These actions do not command
            real equipment.
          </p>
        </div>
        <button
          className="demo-reset"
          disabled={!simulation.history.length}
          onClick={() => {
            dispatch({ type: "RESET" });
            setConnectionTarget("FRG-BB-01");
          }}
        >
          <RotateCcw size={14} />
          Reset Demo
        </button>
      </div>
      <div className="demo-controls-grid">
        <div className="demo-control-cell">
          <strong>
            Equipment fault <span className="mono">AHU-OT-01</span>
          </strong>
          <p>
            Fictional filter pressure: 450 Pa.{" "}
            {simulation.fault
              ? "Fault active until cleared."
              : simulation.connections[FAULT_ASSET_ID]
                ? "Restore monitoring before establishing a new fault."
                : "Starts from a Normal, monitored asset."}
          </p>
          <ScenarioActions assetId={FAULT_ASSET_ID} mode="fault" />
        </div>
        <div className="demo-control-cell">
          <label htmlFor="connection-target">Monitoring source</label>
          <select
            id="connection-target"
            value={connectionTarget}
            onChange={(event) =>
              setConnectionTarget(event.target.value as ConnectionAssetId)
            }
          >
            {CONNECTION_ASSET_IDS.map((id) => (
              <option key={id} value={id}>
                {id}
                {id === FAULT_ASSET_ID
                  ? " · fault + data-loss case"
                  : " · blood bank refrigerator"}
              </option>
            ))}
          </select>
          <ScenarioActions assetId={connectionTarget} mode="connection" />
        </div>
        <div className="demo-control-note">
          <strong>Fault and connectivity are independent.</strong>
          <p>
            Last-known values remain visible when monitoring is lost. An
            unresolved Critical alarm remains last confirmed, currently
            unverified.
          </p>
        </div>
      </div>
      <div className="demo-feedback" role="status" aria-live="polite">
        <span className="demo-feedback-dot" />
        {confirmation}
        <span className="active-connections">
          {Object.keys(simulation.connections).length} simulated connection
          losses ·{" "}
          {persistence === "unavailable"
            ? "Not saved"
            : "Saved in this browser"}
        </span>
      </div>
      {persistence === "unavailable" && (
        <p className="persistence-note">
          Browser storage is unavailable. The demo works in this tab, but
          changes may not survive refresh.
        </p>
      )}
      {persistence === "recovered" && (
        <p className="persistence-note">
          An incompatible saved demo was discarded at startup; the original
          evidence was restored.
        </p>
      )}
    </section>
  );
}
