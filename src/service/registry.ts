import { assets, locations } from "../data/demo";
import type { RegistryAsset, LifecycleRecord, LifecycleStore } from "./types";
export const registry: readonly RegistryAsset[] = [
  ...assets.map(asset => { const location = locations.find(l => l.id === asset.locationId)!; return { id: asset.id, name: asset.name, category: asset.category, department: location.department, location: `${location.building} · ${location.floor} · ${location.room}`, monitored: true, manufacturer: asset.manufacturer, model: asset.model }; }),
  { id: "CT-RAD-01", name: "CT Scanner", category: "Diagnostic imaging", department: "Radiology", location: "Main clinical building · Ground floor · Fictional CT suite", monitored: false, manufacturer: "", model: "" },
  { id: "MRI-RAD-01", name: "MRI System", category: "Diagnostic imaging", department: "Radiology", location: "Main clinical building · Ground floor · Fictional MRI suite", monitored: false, manufacturer: "", model: "" },
];
export const registryAsset = (id: string) => registry.find(asset => asset.id === id);
export function blankLifecycle(assetId: string): LifecycleRecord {
  const asset = registryAsset(assetId);
  if (!asset) throw Error("Unknown lifecycle asset");
  return { assetId, manufacturer: asset.manufacturer, model: asset.model, serial: "", supplier: "", purchaseDate: "", commissioningDate: "", warrantyStart: "", warrantyEnd: "", warrantyTerms: "", contractType: "", contractStart: "", contractEnd: "", contractTerms: "", contact: "", documentReference: "", notes: "", availability: "Not recorded", updatedAt: null, origin: "Synthetic seed" };
}
export function seedLifecycle(): LifecycleStore {
  const records = registry.map(asset => blankLifecycle(asset.id));
  Object.assign(records.find(r => r.assetId === "CT-RAD-01")!, { serial: "DEMO-CT-0001", supplier: "Fictional Delta Imaging Services", purchaseDate: "2020-02-10", commissioningDate: "2020-03-01", warrantyStart: "2020-03-01", warrantyEnd: "2022-02-28", warrantyTerms: "Fictional recorded warranty; scope reference only. No current entitlement inferred.", contractType: "CMC", contractStart: "2024-03-01", contractEnd: "2026-02-28", contractTerms: "Fictional service agreement. Replacement assemblies subject to written confirmation; no entitlement inferred from expiry.", documentReference: "DEMO-CT-CMC-2024", availability: "Out of service, reported", notes: "Synthetic scenario: service coordination is pending. No connected telemetry or real equipment work.", contact: "Service desk reference DEMO-DELTA; contact details not recorded." });
  Object.assign(records.find(r => r.assetId === "MRI-RAD-01")!, { supplier: "Fictional Northstar Technical Care", contractType: "AMC", contractStart: "2025-12-16", contractEnd: "2026-12-15", contractTerms: "Fictional preventive visits; major parts excluded. Confirm actual terms before any decision.", availability: "Limited use, reported", notes: "Synthetic provider-response scenario. Warranty information not recorded." });
  return { schemaVersion: 1, records };
}
