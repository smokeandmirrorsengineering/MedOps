# v0.3.1 — Checkpoint Zero

Baseline: clean v0.3 commit `41a115c`; feature branch `feature/v0.3.1-operational-loop`.

| Boundary                 | Actual finding                                                                                       | Bounded change                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Selection                | ReviewProvider.start always selects otTemplate; Start/home expose one template                       | Add a second explicit template factory and optional subject ID; retain OT default                    |
| Runner                   | Evidence/save/submission already loop over stored template items; some titles and counts say OT/nine | Render the frozen session title and item count                                                       |
| Reports                  | Summary and Detailed Record already loop over the frozen template and response evidence              | Retain print layouts; no report recalculation or alternative review logic                            |
| Equipment evidence       | captureEvidence maps each item's assetIds through the existing shared snapshot                       | Bind all three focused items to exactly the selected existing asset                                  |
| Persistence              | Validation explicitly permits one OT template, nine items and six scoped assets                      | Preserve the OT branch; add a separate, narrow focused-template branch and scoped evidence whitelist |
| Rules                    | Human choice/method/observation/reconciliation, snapshots, exceptions and submission are item-driven | Reuse unchanged rules; no automatic Pass, shortened validation or new equipment evaluator            |
| Historical compatibility | Sessions already freeze template wording; no required subject field exists                           | Subject/source-follow-up fields are optional; old records need no migration or rewrite               |

**Decision:** Focused Investigation can proceed through bounded selection/binding/validation changes. The core review engine does not need a rewrite. Regression coverage must keep the original OT persistence path and frozen reports valid before enabling the second template.

Follow-ups remain separate operational records under `evidanor:followups:v1`. Current actions link outside the historical report article and are excluded from printing. Action Completed never resolves an inspection exception or changes equipment evidence. Guide progress and asset activity are separate projections of actual records; guide restart cannot delete them.
