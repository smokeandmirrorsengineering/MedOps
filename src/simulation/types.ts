import type { AssetEvent, Reading } from "../domain/types";

export const FAULT_ASSET_ID = "AHU-OT-01";
export const CONNECTION_ASSET_IDS = ["FRG-BB-01", FAULT_ASSET_ID] as const;
export type ConnectionAssetId = (typeof CONNECTION_ASSET_IDS)[number];
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = "medops.demo.simulation.v1";

export type SimulationAction =
  | { type: "ACTIVATE_FAULT" }
  | { type: "CLEAR_FAULT" }
  | { type: "RESET" }
  | { type: "LOSE_CONNECTION"; assetId: ConnectionAssetId }
  | { type: "RESTORE_CONNECTION"; assetId: ConnectionAssetId };
export type Transition =
  | "fault-activated"
  | "fault-cleared"
  | "connection-lost"
  | "connection-restored";

// Deliberately NOT an AssetEvent: historical logs have no active-alarm flag.
export interface SimulationEvent {
  id: string;
  sequence: number;
  assetId: string;
  timestamp: string;
  transition: Transition;
  severity: AssetEvent["severity"];
  title: string;
  description: string;
}
export interface SimulationOverlay {
  schemaVersion: typeof SCHEMA_VERSION;
  simNow: string;
  fault: { confirmedAt: string; activationSequence: number } | null;
  connections: Partial<
    Record<
      ConnectionAssetId,
      {
        lostAt: string;
        activationSequence: number;
        lastKnownReadings: readonly Reading[];
      }
    >
  >;
  history: readonly SimulationEvent[];
  nextSequence: number;
  lastAction: "INITIAL" | SimulationAction["type"];
}
export interface SimulationAlert extends AssetEvent {
  origin: "simulation";
  kind: "Equipment condition" | "Monitoring unavailable";
  sequence: number;
  resolvedAt?: string;
  resolvedSequence?: number;
}
export type DisplayAlert = AssetEvent &
  Partial<Omit<SimulationAlert, keyof AssetEvent>>;
export interface AssetSimulation {
  faultActive: boolean;
  connectionLost: boolean;
  lastConfirmedCritical: boolean;
  confirmedAt: string | null;
}
export function isConnectionAsset(id: string): id is ConnectionAssetId {
  return CONNECTION_ASSET_IDS.some((assetId) => assetId === id);
}
