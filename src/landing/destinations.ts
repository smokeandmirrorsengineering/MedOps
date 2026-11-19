/** Existing demo routes only; never link to visitor-specific saved record IDs. */
export const landingDestinations = {
  dashboard: "/dashboard",
  investigation: "/reviews/new?template=focused&subject=MG-O2-01",
  evidence: "/assets?asset=MG-O2-01",
  ctCase: "/service/cases/SC-DEMO-CT-001",
} as const;
