import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { Dispatch, ReactNode } from "react";
import { mockDataProvider } from "../data/provider";
import { buildDashboard } from "../domain/selectors";
import type { AssetEvent, Snapshot } from "../domain/types";
import { orderEvents } from "../lib/navigation";
import {
  assetSimulation,
  createSimulationReducer,
  effectiveSnapshot,
  scenarioAlerts,
} from "../simulation/model";
import type {
  AssetSimulation,
  DisplayAlert,
  SimulationAction,
  SimulationEvent,
  SimulationOverlay,
} from "../simulation/types";
import {
  browserStorage,
  readSimulation,
  saveSimulation,
} from "../simulation/persistence";
import type { PersistenceStatus } from "../simulation/persistence";

type EvaluatedAsset = Readonly<
  ReturnType<typeof buildDashboard>["evaluated"][number]
>;
interface DemoData {
  readonly snapshot: Readonly<Snapshot>;
  readonly evaluated: readonly EvaluatedAsset[];
  readonly counts: Readonly<ReturnType<typeof buildDashboard>["counts"]>;
  readonly total: number;
  readonly activeEvents: readonly DisplayAlert[];
  readonly allAlerts: readonly DisplayAlert[];
  readonly history: readonly SimulationEvent[];
  readonly seedEvents: readonly AssetEvent[];
  readonly simulation: SimulationOverlay;
  readonly persistence: PersistenceStatus;
  readonly dispatch: Dispatch<SimulationAction>;
  readonly getAssetSimulation: (id: string) => AssetSimulation;
  readonly getAsset: (id: string) => EvaluatedAsset | undefined;
}
const DemoDataContext = createContext<DemoData | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [seed] = useState(() => mockDataProvider.getSnapshot());
  const reducer = useMemo(() => createSimulationReducer(seed), [seed]);
  const [bootstrap] = useState(() => readSimulation(browserStorage(), seed));
  const [simulation, dispatch] = useReducer(reducer, bootstrap.overlay);
  const [persistence, setPersistence] = useState<PersistenceStatus>(
    bootstrap.status,
  );
  useEffect(() => {
    const saved = saveSimulation(browserStorage(), simulation);
    setPersistence((current) =>
      saved ? (current === "recovered" ? "recovered" : "ready") : "unavailable",
    );
  }, [simulation]);
  const value = useMemo<DemoData>(() => {
    const snapshot = effectiveSnapshot(seed, simulation);
    const dashboard = buildDashboard(snapshot);
    const byId = new Map(dashboard.evaluated.map((asset) => [asset.id, asset]));
    const allAlerts = orderEvents<DisplayAlert>([
      ...seed.events.filter((event) => event.active),
      ...scenarioAlerts(simulation),
    ]);
    return {
      snapshot,
      ...dashboard,
      allAlerts,
      activeEvents: allAlerts.filter((event) => event.active),
      history: simulation.history,
      seedEvents: seed.events,
      simulation,
      dispatch,
      persistence,
      getAssetSimulation: (id) => assetSimulation(simulation, id),
      getAsset: (id) => byId.get(id),
    };
  }, [seed, simulation, persistence]);
  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
}
export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context)
    throw new Error("useDemoData must be used within DemoDataProvider");
  return context;
}
