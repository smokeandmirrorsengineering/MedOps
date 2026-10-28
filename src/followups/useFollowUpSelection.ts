import { useSearchParams } from "react-router";
import { useFollowUps } from "./FollowUpProvider";
export function useFollowUpSelection() {
  const [params, setParams] = useSearchParams();
  const { records } = useFollowUps();
  function open(reviewId: string, exceptionId: string) {
    const existing = records.find(
      (record) =>
        record.sourceReviewId === reviewId &&
        record.sourceExceptionId === exceptionId,
    );
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("asset");
      next.delete("followup");
      next.delete("followupSource");
      next.set(
        existing ? "followup" : "followupSource",
        existing?.id ?? exceptionId,
      );
      return next;
    });
  }
  function close() {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("followup");
        next.delete("followupSource");
        return next;
      },
      { replace: true },
    );
  }
  return {
    id: params.get("followup"),
    source: params.get("followupSource"),
    open,
    close,
    show(id: string) {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.delete("followupSource");
          next.set("followup", id);
          return next;
        },
        { replace: true },
      );
    },
  };
}
