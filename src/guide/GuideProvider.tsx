import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReviews } from "../reviews/ReviewProvider";
import { useFollowUps } from "../followups/FollowUpProvider";
import { actionClock, type ActionClock } from "../followups/types";
import { useDemoData } from "../state/DemoDataProvider";
import { browserStorage } from "../simulation/persistence";
import { createGuideSession, guideProgress, type GuideSession } from "./model";
import { readGuide, writeGuide } from "./persistence";
function useGuideState(clock: ActionClock) {
  const { sessions } = useReviews(),
    { records } = useFollowUps(),
    data = useDemoData();
  const [initial] = useState(() => readGuide(browserStorage()));
  const [session, setSession] = useState(initial.session),
    latest = useRef(session);
  const [status, setStatus] = useState(initial.status),
    previousFault = useRef(!!data.simulation.fault);
  const commit = useCallback((next: GuideSession | null) => {
    latest.current = next;
    setSession(next);
    setStatus(writeGuide(browserStorage(), next) ? "saved" : "unavailable");
  }, []);
  useEffect(() => {
    const before = previousFault.current;
    previousFault.current = !!data.simulation.fault;
    const active = latest.current;
    if (active && !before && data.simulation.fault && !active.detectedAt)
      commit({ ...active, detectedAt: clock.now() });
  }, [data.simulation.fault, clock, commit]);
  const noteAssetViewed = useCallback(
    (assetId: string, abnormal: boolean) => {
      const current = latest.current;
      if (
        !current ||
        current.targetAssetId !== assetId ||
        current.assetViewedAt
      )
        return;
      const at = clock.now();
      commit({
        ...current,
        assetViewedAt: at,
        detectedAt: current.detectedAt ?? (abnormal ? at : null),
      });
    },
    [clock, commit],
  );
  const noteReportViewed = useCallback(
    (id: string) => {
      const current = latest.current;
      if (
        !current ||
        current.baselineReviewIds.includes(id) ||
        current.viewedReportIds.includes(id)
      )
        return;
      commit({ ...current, viewedReportIds: [...current.viewedReportIds, id] });
    },
    [commit],
  );
  return {
    session,
    status,
    progress: session ? guideProgress(session, sessions, records) : null,
    noteAssetViewed,
    noteReportViewed,
    start() {
      commit(createGuideSession(sessions, records, clock));
    },
    restart() {
      commit(createGuideSession(sessions, records, clock));
    },
    exit() {
      commit(null);
    },
  };
}
const Context = createContext<ReturnType<typeof useGuideState> | null>(null);
export function GuideProvider({
  children,
  clock = actionClock,
}: {
  children: ReactNode;
  clock?: ActionClock;
}) {
  const value = useGuideState(clock);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useGuide() {
  const value = useContext(Context);
  if (!value) throw Error("GuideProvider is required");
  return value;
}
