export const categories = [
  "HVAC & Operating Theatre Infrastructure",
  "Medical Gas Systems",
  "Refrigeration & Cold Storage",
  "Electrical & Backup Power",
  "Laboratory Equipment",
] as const;
export type Category = (typeof categories)[number];
export type Condition = "Normal" | "Attention" | "Critical" | "Unknown";
export type OperatingState = "Running" | "Standby" | "Stopped";
export type Quality = "Good" | "Unavailable" | "Uncertain";

export interface Location {
  id: string;
  building: string;
  floor: string;
  department: string;
  room: string;
}
export interface Asset {
  readonly id: string;
  name: string;
  category: Category;
  locationId: string;
  manufacturer: string;
  model: string;
  operatingState: OperatingState;
  monitoring: {
    method: "Simulated telemetry" | "Manual inspection";
    connectivity: "Available" | "Unavailable" | "Inspection based";
    source: string;
    expectedIntervalMinutes: number;
  };
}
// All limits are fictional demonstration values, never hospital safety criteria.
export interface MonitoringPoint {
  id: string;
  assetId: string;
  label: string;
  unit: string;
  warningAbove?: number;
  warningBelow?: number;
  criticalAbove?: number;
  criticalBelow?: number;
}
export interface Reading {
  pointId: string;
  assetId: string;
  value: number | null;
  unit: string;
  quality: Quality;
  timestamp: string;
}
export interface AssetEvent {
  id: string;
  assetId: string;
  timestamp: string;
  severity: "Info" | "Attention" | "Critical";
  title: string;
  description: string;
  active: boolean;
}
export interface MaintenanceRecord {
  id: string;
  assetId: string;
  lastServiceDate: string;
  nextServiceDate: string;
  summary: string;
  technician: string;
}
export interface SampleDocument {
  id: string;
  assetId: string;
  title: string;
  kind: string;
  revision: string;
  placeholder: true;
}
export interface Evidence {
  points: readonly MonitoringPoint[];
  readings: readonly Reading[];
  events: readonly AssetEvent[];
  maintenance: readonly MaintenanceRecord[];
}
export interface Evaluation {
  condition: Condition;
  reasons: string[];
  lastReported: string | null;
}
export interface Snapshot extends Evidence {
  now: string;
  assets: readonly Asset[];
  locations: readonly Location[];
  documents: readonly SampleDocument[];
}
