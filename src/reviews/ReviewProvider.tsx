import { createContext, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useDemoData } from "../state/DemoDataProvider";
import { browserStorage } from "../simulation/persistence";
import { captureEvidence } from "./evidence";
import { createReview, saveResponse, submitReview } from "./model";
import type { ResponseInput } from "./model";
import { readReviews, writeReviews } from "./persistence";
import { otTemplate } from "./template";
import { focusedTemplate, FOCUSED_TEMPLATE_ID } from "./focused";
import { reviewClock } from "./types";
import type { ReviewClock, ReviewSession, ReviewStore } from "./types";

interface ReviewsContextValue {
  sessions: readonly ReviewSession[];
  status: "saved" | "recovered" | "unavailable";
  clock: ReviewClock;
  start(input: {
    technician: string;
    role: string;
    openingNotes: string;
    templateId?: string;
    subjectAssetId?: string;
    sourceFollowUpId?: string;
  }): string;
  save(
    id: string,
    itemId: string,
    input: ResponseInput,
    options: { refresh?: boolean; retentionNote?: string },
  ): string[];
  summary(id: string, text: string): void;
  submit(id: string): string[];
}
const ReviewContext = createContext<ReviewsContextValue | null>(null);
export function ReviewProvider({
  children,
  clock = reviewClock,
}: {
  children: ReactNode;
  clock?: ReviewClock;
}) {
  const { snapshot } = useDemoData();
  const [initial] = useState(() => readReviews(browserStorage()));
  const [store, setStore] = useState<ReviewStore>(initial.store);
  const latest = useRef(store);
  const [status, setStatus] = useState<ReviewsContextValue["status"]>(
    initial.status,
  );
  function commit(review: ReviewSession) {
    const current = latest.current;
    if (
      current.sessions.some(
        (session) => session.id === review.id && session.status === "Submitted",
      )
    )
      return;
    const next = {
      ...current,
      sessions: current.sessions.some((session) => session.id === review.id)
        ? current.sessions.map((session) =>
            session.id === review.id ? review : session,
          )
        : [review, ...current.sessions],
    };
    latest.current = next;
    setStore(next);
    setStatus(writeReviews(browserStorage(), next) ? "saved" : "unavailable");
  }
  const value: ReviewsContextValue = {
    sessions: store.sessions,
    status,
    clock,
    start(input) {
      const {
        templateId = otTemplate.id,
        subjectAssetId,
        sourceFollowUpId,
        ...identity
      } = input;
      if (![otTemplate.id, FOCUSED_TEMPLATE_ID].includes(templateId))
        throw Error("Choose an available review template.");
      const template =
        templateId === FOCUSED_TEMPLATE_ID
          ? focusedTemplate(snapshot, subjectAssetId ?? "")
          : otTemplate;
      const review = createReview(
        template,
        {
          ...identity,
          ...(templateId === FOCUSED_TEMPLATE_ID
            ? {
                subjectAssetId,
                ...(sourceFollowUpId ? { sourceFollowUpId } : {}),
              }
            : {}),
        },
        clock,
      );
      commit(review);
      return review.id;
    },
    save(id, itemId, input, options) {
      const review = latest.current.sessions.find(
        (session) => session.id === id,
      );
      if (!review) return ["Review not found."];
      const item = review.template.items.find((item) => item.id === itemId);
      if (!item) return ["Item not found."];
      const evidence = captureEvidence(
        item,
        review.template,
        snapshot,
        latest.current.sessions,
        clock.now(),
      );
      const result = saveResponse(
        review,
        itemId,
        input,
        evidence,
        clock,
        options,
      );
      if (!result.errors.length) commit(result.review);
      return result.errors;
    },
    summary(id, text) {
      const review = latest.current.sessions.find(
        (session) => session.id === id,
      );
      if (review?.status === "Draft") commit({ ...review, summary: text });
    },
    submit(id) {
      const review = latest.current.sessions.find(
        (session) => session.id === id,
      );
      if (!review) return ["Review not found."];
      const evidence = Object.fromEntries(
        review.template.items.map((item) => [
          item.id,
          captureEvidence(
            item,
            review.template,
            snapshot,
            latest.current.sessions,
            clock.now(),
          ),
        ]),
      );
      const result = submitReview(review, evidence, clock);
      if (!result.errors.length) commit(result.review);
      return result.errors;
    },
  };
  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}
export function useReviews() {
  const value = useContext(ReviewContext);
  if (!value) throw Error("useReviews requires ReviewProvider");
  return value;
}
