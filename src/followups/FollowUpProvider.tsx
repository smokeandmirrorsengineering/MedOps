import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReviews } from "../reviews/ReviewProvider";
import { browserStorage } from "../simulation/persistence";
import {
  actionClock,
  type ActionClock,
  type FollowUpStatus,
  type FollowUpStore,
} from "./types";
import { createFollowUp, updateFollowUp } from "./model";
import { readFollowUps, writeFollowUps } from "./persistence";
function useFollowUpState(clock: ActionClock) {
  const { sessions } = useReviews();
  const [initial] = useState(() => readFollowUps(browserStorage()));
  const [store, setStore] = useState(initial.store),
    latest = useRef(store);
  const [status, setStatus] = useState<"saved" | "recovered" | "unavailable">(
    initial.status,
  );
  function commit(next: FollowUpStore) {
    latest.current = next;
    setStore(next);
    setStatus(writeFollowUps(browserStorage(), next) ? "saved" : "unavailable");
  }
  return {
    records: store.records,
    status,
    create(
      reviewId: string,
      exceptionId: string,
      input: { responsible: string; proposedAction: string },
    ) {
      const review = sessions.find((review) => review.id === reviewId);
      if (!review)
        return {
          id: null,
          errors: ["The source review is unavailable in this browser."],
        };
      const result = createFollowUp(
        latest.current,
        review,
        exceptionId,
        input,
        clock,
      );
      if (!result.errors.length && result.store !== latest.current)
        commit(result.store);
      return { id: result.record?.id ?? null, errors: result.errors };
    },
    update(
      id: string,
      input: {
        responsible: string;
        proposedAction: string;
        status: FollowUpStatus;
        note: string;
      },
    ) {
      const record = latest.current.records.find((record) => record.id === id);
      if (!record) return ["Follow-up not found."];
      const result = updateFollowUp(record, input, clock);
      if (!result.errors.length)
        commit({
          ...latest.current,
          records: latest.current.records.map((record) =>
            record.id === id ? result.record : record,
          ),
        });
      return result.errors;
    },
  };
}
const Context = createContext<ReturnType<typeof useFollowUpState> | null>(null);
export function FollowUpProvider({
  children,
  clock = actionClock,
}: {
  children: ReactNode;
  clock?: ActionClock;
}) {
  const value = useFollowUpState(clock);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useFollowUps() {
  const value = useContext(Context);
  if (!value) throw Error("FollowUpProvider is required");
  return value;
}
