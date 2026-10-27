import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { mockDataProvider } from "../data/provider";
import { buildDashboard } from "../domain/selectors";
import type { AssetEvent, Snapshot } from "../domain/types";
import { orderEvents } from "../lib/navigation";

type EvaluatedAsset = Readonly<
  ReturnType<typeof buildDashboard>["evaluated"][number]
>;
interface DemoData {
  readonly snapshot: Readonly<Snapshot>;
  readonly evaluated: readonly EvaluatedAsset[];
  readonly counts: Readonly<ReturnType<typeof buildDashboard>["counts"]>;
  readonly total: number;
  readonly activeEvents: readonly Readonly<AssetEvent>[];
  readonly getAsset: (id: string) => EvaluatedAsset | undefined;
}
const DemoDataContext = createContext<DemoData | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [snapshot] = useState(() => mockDataProvider.getSnapshot());
  const value = useMemo<DemoData>(() => {
    const dashboard = buildDashboard(snapshot);
    const byId = new Map(dashboard.evaluated.map((asset) => [asset.id, asset]));
    return {
      snapshot,
      ...dashboard,
      activeEvents: orderEvents(
        snapshot.events.filter((event) => event.active),
      ),
      getAsset: (id) => byId.get(id),
    };
  }, [snapshot]);
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
