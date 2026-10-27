import type { AssetEvent, Snapshot } from "../domain/types";
import { FAULT_ASSET_ID, isConnectionAsset, SCHEMA_VERSION } from "./types";
import type { AssetSimulation, SimulationAction, SimulationAlert, SimulationEvent, SimulationOverlay } from "./types";

export function initialOverlay(seed: Snapshot): SimulationOverlay {
  return { schemaVersion: SCHEMA_VERSION, simNow: seed.now, fault: null, connections: {}, history: [], nextSequence: 1, lastAction: "INITIAL" };
}

export function assetSimulation(overlay: SimulationOverlay, assetId: string): AssetSimulation {
  const faultActive = assetId === FAULT_ASSET_ID && overlay.fault !== null;
  const connectionLost = isConnectionAsset(assetId) && !!overlay.connections[assetId];
  return { faultActive, connectionLost, lastConfirmedCritical: faultActive && connectionLost, confirmedAt: faultActive ? overlay.fault!.confirmedAt : null };
}

// Apply current evidence only. Historical transition records never enter the evaluator.
export function effectiveSnapshot(seed: Snapshot, overlay: SimulationOverlay): Snapshot {
  if (!overlay.fault && !Object.keys(overlay.connections).length) return { ...seed, now: overlay.simNow };
  const faultPoint = seed.points.find(point => point.assetId === FAULT_ASSET_ID && point.label === "Filter differential pressure");
  const assets = seed.assets.map(asset => isConnectionAsset(asset.id) && overlay.connections[asset.id]
    ? { ...asset, monitoring: { ...asset.monitoring, connectivity: "Unavailable" as const } } : asset);
  const readings = seed.readings.map(reading => {
    const loss = isConnectionAsset(reading.assetId) ? overlay.connections[reading.assetId] : undefined;
    if (loss) {
      const lastKnown = loss.lastKnownReadings.find(previous => previous.pointId === reading.pointId);
      return { ...(lastKnown ?? reading), quality: "Unavailable" as const };
    }
    return overlay.fault && reading.pointId === faultPoint?.id
      ? { ...reading, value: 450, quality: "Good" as const, timestamp: overlay.fault.confirmedAt } : reading;
  });
  const currentAlarms: AssetEvent[] = overlay.fault ? [{
    id: `current-fault-${overlay.fault.activationSequence}`, assetId: FAULT_ASSET_ID,
    timestamp: overlay.fault.confirmedAt, severity: "Critical", active: true,
    title: overlay.connections[FAULT_ASSET_ID]
      ? "Unresolved simulated critical fault — last confirmed; currently unverified."
      : "Active simulated critical filter fault.",
    description: "Synthetic filter pressure reached 450 Pa while monitoring was available. This alarm remains unresolved until Clear Fault; restoring communication does not clear it.",
  }] : [];
  return { ...seed, now: overlay.simNow, assets, readings, events: [...seed.events, ...currentAlarms] };
}

export function createSimulationReducer(seed: Snapshot) {
  return function simulationReducer(state: SimulationOverlay, action: SimulationAction): SimulationOverlay {
    if (action.type === "RESET") {
      if (state.lastAction === "RESET" && !state.history.length) return state;
      return { ...initialOverlay(seed), lastAction: "RESET" };
    }
    const sequence = state.nextSequence;
    if (!Number.isSafeInteger(sequence + 1)) return state;
    let next = { ...state, nextSequence: sequence + 1, lastAction: action.type };
    let entry: Omit<SimulationEvent, "id" | "sequence" | "timestamp">;
    if (action.type === "ACTIVATE_FAULT") {
      // A newly confirmed fault needs usable evidence. Existing confirmed alarms survive loss.
      if (state.fault || state.connections[FAULT_ASSET_ID]) return state;
      next.fault = { confirmedAt: state.simNow, activationSequence: sequence };
      entry = { assetId: FAULT_ASSET_ID, transition: "fault-activated", severity: "Critical", title: "Simulated fault activated", description: "AHU-OT-01 filter pressure changed to a fictional 450 Pa while monitoring was available. An unresolved Critical alarm was established." };
    } else if (action.type === "CLEAR_FAULT") {
      if (!state.fault) return state;
      next.fault = null;
      entry = { assetId: FAULT_ASSET_ID, transition: "fault-cleared", severity: "Info", title: "Simulated fault cleared", description: state.connections[FAULT_ASSET_ID] ? "The simulated alarm was cleared; monitoring remains unavailable, so equipment condition is Unknown. Last-known readings are retained." : "The simulated alarm was cleared and original evidence restored. This demonstration action does not certify equipment safety." };
    } else if (action.type === "LOSE_CONNECTION") {
      if (!isConnectionAsset(action.assetId) || state.connections[action.assetId]) return state;
      const snapshot = effectiveSnapshot(seed, state);
      next.connections = { ...state.connections, [action.assetId]: {
        lostAt: state.simNow, activationSequence: sequence,
        lastKnownReadings: snapshot.readings.filter(reading => reading.assetId === action.assetId).map(reading => ({ ...reading })),
      } };
      entry = { assetId: action.assetId, transition: "connection-lost", severity: "Info", title: "Simulated communication lost", description: `${action.assetId} monitoring is unavailable. Last-known values and timestamps are retained with Unavailable quality.${action.assetId === FAULT_ASSET_ID && state.fault ? " The unresolved Critical alarm remains last confirmed, currently unverified." : " Condition cannot be verified from these readings."}` };
    } else {
      if (!isConnectionAsset(action.assetId) || !state.connections[action.assetId]) return state;
      next.connections = { ...state.connections };
      delete next.connections[action.assetId];
      entry = { assetId: action.assetId, transition: "connection-restored", severity: "Info", title: "Simulated communication restored", description: `${action.assetId} simulated monitoring is available again. ${action.assetId === FAULT_ASSET_ID && state.fault ? "The active Critical fault is still unresolved." : "Original current evidence is available again."} Restoring communication does not resolve a physical fault.` };
    }
    next.history = [...state.history, { ...entry, id: `sim-event-${sequence}`, sequence, timestamp: state.simNow }];
    return next;
  };
}

// A display projection of alarm lifecycles, separate from condition-evaluation evidence.
export function scenarioAlerts(overlay: SimulationOverlay): SimulationAlert[] {
  const alerts: SimulationAlert[] = [];
  const open = new Map<string, number>();
  for (const event of overlay.history) {
    const fault = event.transition.startsWith("fault-");
    const key = `${fault ? "fault" : "connection"}:${event.assetId}`;
    if (event.transition === "fault-activated" || event.transition === "connection-lost") {
      open.set(key, alerts.length);
      alerts.push({ id: `sim-alert-${event.sequence}`, assetId: event.assetId, timestamp: event.timestamp, severity: fault ? "Critical" : "Info", title: fault ? "Simulated AHU filter fault" : "Simulated monitoring unavailable", description: event.description, active: true, origin: "simulation", kind: fault ? "Equipment condition" : "Monitoring unavailable", sequence: event.sequence });
    } else {
      const index = open.get(key);
      if (index !== undefined) alerts[index] = { ...alerts[index], active: false, resolvedAt: event.timestamp, resolvedSequence: event.sequence };
      open.delete(key);
    }
  }
  return alerts;
}

export function orderedHistory(history: readonly SimulationEvent[]) {
  return [...history].sort((a,b) => Date.parse(b.timestamp) - Date.parse(a.timestamp) || b.sequence - a.sequence);
}
