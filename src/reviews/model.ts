import {
  applicableAssets,
  evidenceChanges,
  isAbnormal,
  isGap,
} from "./evidence";
import { hasFollowUpText } from "./followUp";
import type {
  EvidenceAsset,
  EvidenceSnapshot,
  HumanVerification,
  ItemResponse,
  ReviewClock,
  ReviewException,
  ReviewSession,
  ReviewTemplate,
  TemplateItem,
} from "./types";

export type ResponseInput = HumanVerification &
  Pick<ItemResponse, "gaps" | "acknowledgedIssues">;
export const hasText = (value: string) => !!value.trim();
function responseIssues(
  value: HumanVerification,
  assets: EvidenceAsset[],
): string[] {
  const types: string[] = [];
  if (["Attention", "Fail", "Unable to Verify"].includes(value.choice))
    types.push(value.choice);
  if (
    ["Pass", "Not Applicable"].includes(value.choice) &&
    assets.some(isAbnormal)
  )
    types.push("Evidence discrepancy");
  return types;
}
export function verificationErrors(
  value: HumanVerification,
  item: TemplateItem,
  assets: EvidenceAsset[],
  prefix = "",
  historical = false,
): string[] {
  const errors: string[] = [];
  if (!value.choice || !item.allowedResponses.includes(value.choice as never))
    errors.push("Choose a human response; none is automatic.");
  if (["Pass", "Attention", "Fail"].includes(value.choice) && !value.method)
    errors.push("A verification method is required.");
  if (value.method && !item.allowedMethods.includes(value.method))
    errors.push("Choose an allowed verification method.");
  if (
    (value.choice === "Unable to Verify" ||
      value.choice === "Not Applicable") &&
    !hasText(value.observation)
  )
    errors.push("Explain Unable to Verify / Not Applicable in observations.");
  if (
    ((item.rules.observationOnAbnormal && assets.some(isAbnormal)) ||
      ["Attention", "Fail"].includes(value.choice)) &&
    !hasText(value.observation)
  )
    errors.push(
      "Record an observation addressing the abnormal evidence or response.",
    );
  if (value.method === "Other" && !hasText(value.observation + value.notes))
    errors.push("Explain the Other verification method.");
  if (
    item.rules.reconcilePassConflict &&
    value.choice === "Pass" &&
    assets.some(
      (asset) =>
        asset.condition === "Critical" || asset.condition === "Unknown",
    ) &&
    !hasText(value.reconciliation)
  )
    errors.push(
      "Pass conflicts with Critical/Unknown evidence: an explicit reconciliation note is required.",
    );
  if (
    !historical &&
    responseIssues(value, assets).length &&
    (!hasFollowUpText(value.responsible) || !hasFollowUpText(value.followUp))
  )
    errors.push(
      "Open exceptions require a responsible role/person and suggested follow-up; N/A and other placeholders are not sufficient.",
    );
  return errors.map((error) => prefix + error);
}
export function responseErrors(
  response: ItemResponse,
  item: TemplateItem,
  options: { historical?: boolean } = {},
): string[] {
  const assets =
    item.kind === "gaps" ? [] : applicableAssets(item, response.evidence);
  const errors = verificationErrors(
    response,
    item,
    assets,
    "",
    options.historical,
  );
  if (
    new Set(response.gaps.map((gap) => gap.assetId)).size !==
    response.gaps.length
  )
    errors.push("Each affected asset must have one gap verification.");
  if (
    response.gaps.some(
      (gap) =>
        item.kind !== "gaps" ||
        !response.evidence.assets.some(
          (asset) => asset.id === gap.assetId && isGap(asset),
        ),
    )
  )
    errors.push(
      "Gap verifications must refer only to affected assets in this item.",
    );
  if (item.kind === "gaps")
    for (const asset of response.evidence.assets.filter(isGap)) {
      const gap = response.gaps.find((gap) => gap.assetId === asset.id);
      if (!gap)
        errors.push(
          `${asset.id}: record an individual verification or exception.`,
        );
      else
        errors.push(
          ...verificationErrors(
            gap,
            item,
            [asset],
            `${asset.id}: `,
            options.historical,
          ),
        );
    }
  const issues = new Map(
    [
      ...response.evidence.issues,
      ...(response.changeAcknowledgement?.evidence.issues ?? []),
    ].map((issue) => [issue.key, issue]),
  );
  for (const issue of issues.values())
    if (!response.acknowledgedIssues.includes(issue.key))
      errors.push(
        `Acknowledge review of: ${issue.title} (${issue.assetId ?? "review issue"}).`,
      );
  if (
    response.changeAcknowledgement &&
    (!hasText(response.changeAcknowledgement.note) ||
      (!options.historical &&
        (!hasFollowUpText(response.responsible) ||
          !hasFollowUpText(response.followUp))))
  )
    errors.push(
      "Continuing with changed evidence requires an explanation, responsible role/person and follow-up.",
    );
  return errors;
}
export function deriveExceptions(review: ReviewSession): ReviewException[] {
  const result = new Map<string, ReviewException>();
  for (const item of review.template.items) {
    const response = review.responses[item.id];
    if (!response) continue;
    function add(
      value: HumanVerification,
      assets: EvidenceAsset[],
      types = responseIssues(value, assets),
    ) {
      for (const type of types) {
        const affected =
          type === "Evidence discrepancy"
            ? assets.filter(isAbnormal)
            : assets.length === 1
              ? assets
              : [null];
        for (const asset of affected) {
          const id = `${review.id}|${item.id}|${asset?.id ?? "scope"}|${type}`;
          result.set(id, {
            id,
            reviewId: review.id,
            itemId: item.id,
            itemTitle: item.title,
            assetId: asset?.id ?? null,
            assetName: asset?.name ?? null,
            issueType: type as ReviewException["issueType"],
            observation: [
              value.observation,
              type === "Evidence discrepancy" ? value.reconciliation : "",
            ]
              .filter(Boolean)
              .join(" · "),
            responsible: value.responsible,
            followUp: value.followUp,
            status: "Open",
          });
        }
      }
    }
    if (item.kind === "gaps" && response.evidence.assets.some(isGap))
      for (const gap of response.gaps)
        add(
          gap,
          response.evidence.assets.filter(
            (asset) => asset.id === gap.assetId && isGap(asset),
          ),
        );
    else add(response, applicableAssets(item, response.evidence));
    if (response.changeAcknowledgement) {
      const changed = response.changeAcknowledgement.evidence.assets.filter(
        (asset) =>
          evidenceChanges(
            {
              ...response.evidence,
              assets: response.evidence.assets.filter((a) => a.id === asset.id),
              issues: [],
            },
            {
              ...response.changeAcknowledgement!.evidence,
              assets: [asset],
              issues: [],
            },
            item,
          ).length,
      );
      add(
        { ...response, observation: response.changeAcknowledgement.note },
        changed,
        ["Evidence changed"],
      );
    }
  }
  return [...result.values()];
}
export function createReview(
  template: ReviewTemplate,
  input: { technician: string; role: string; openingNotes: string },
  clock: ReviewClock,
): ReviewSession {
  if (!hasText(input.technician) || !hasText(input.role))
    throw new Error(
      "Technician name and role are required (unverified typed information).",
    );
  return {
    id: clock.id(),
    template: structuredClone(template),
    scopeId: template.scopeId,
    scope: template.scope,
    ...input,
    summary: "",
    status: "Draft",
    createdAt: clock.now(),
    submittedAt: null,
    responses: {},
    exceptions: [],
  };
}
export function saveResponse(
  review: ReviewSession,
  itemId: string,
  input: ResponseInput,
  current: EvidenceSnapshot,
  clock: ReviewClock,
  options: { refresh?: boolean; retentionNote?: string } = {},
): { review: ReviewSession; errors: string[] } {
  if (review.status !== "Draft")
    return { review, errors: ["Submitted reviews are immutable."] };
  const item = review.template.items.find((item) => item.id === itemId);
  if (!item) return { review, errors: ["Unknown checklist item."] };
  const previous = review.responses[itemId],
    now = clock.now();
  const evidence =
    previous && !options.refresh
      ? previous.evidence
      : { ...current, capturedAt: now };
  const changes = evidenceChanges(evidence, current, item);
  let changeAcknowledgement =
    previous && !options.refresh ? previous.changeAcknowledgement : null;
  if (changes.length) {
    if (hasText(options.retentionNote ?? ""))
      changeAcknowledgement = {
        evidence: structuredClone(current),
        note: options.retentionNote!,
        notedAt: now,
        changes,
      };
    else if (
      !changeAcknowledgement ||
      evidenceChanges(changeAcknowledgement.evidence, current, item).length
    )
      return {
        review,
        errors: [
          "Evidence changed. Choose Refresh Evidence, or explain why you are continuing with recorded evidence.",
        ],
      };
  } else changeAcknowledgement = null;
  const response: ItemResponse = structuredClone({
    ...input,
    itemId,
    evidence,
    savedAt: now,
    changeAcknowledgement,
  });
  const errors = responseErrors(response, item);
  if (errors.length) return { review, errors };
  const updated = {
    ...review,
    responses: { ...review.responses, [itemId]: response },
  };
  return {
    review: { ...updated, exceptions: deriveExceptions(updated) },
    errors: [],
  };
}
export function submissionErrors(
  review: ReviewSession,
  current: Record<string, EvidenceSnapshot>,
): string[] {
  const errors: string[] = [];
  for (const item of review.template.items) {
    const response = review.responses[item.id];
    if (!response) {
      errors.push(`${item.order}. ${item.title}: response has not been saved.`);
      continue;
    }
    errors.push(
      ...responseErrors(response, item).map(
        (error) => `${item.order}. ${error}`,
      ),
    );
    if (
      evidenceChanges(response.evidence, current[item.id], item).length &&
      (!response.changeAcknowledgement ||
        evidenceChanges(
          response.changeAcknowledgement.evidence,
          current[item.id],
          item,
        ).length)
    )
      errors.push(
        `${item.order}. Evidence changed: review again or explicitly record the discrepancy.`,
      );
    if (item.kind === "issues")
      for (const issue of current[item.id].issues)
        if (!response.acknowledgedIssues.includes(issue.key))
          errors.push(
            `${item.order}. New issue requires acknowledgement: ${issue.title}.`,
          );
  }
  return errors;
}
export function submitReview(
  review: ReviewSession,
  current: Record<string, EvidenceSnapshot>,
  clock: ReviewClock,
): { review: ReviewSession; errors: string[] } {
  if (review.status !== "Draft")
    return { review, errors: ["Submitted reviews are immutable."] };
  const errors = submissionErrors(review, current);
  if (errors.length) return { review, errors };
  return {
    review: structuredClone({
      ...review,
      status: "Submitted",
      submittedAt: clock.now(),
      exceptions: deriveExceptions(review),
    }),
    errors: [],
  };
}
