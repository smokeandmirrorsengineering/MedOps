/** Existing demo routes only; never link to visitor-specific saved record IDs. */
export const landingDestinations = {
  dashboard: "/dashboard",
  investigation: "/reviews/new?template=focused&subject=MG-O2-01",
  evidence: "/assets?asset=MG-O2-01",
  ctCase: "/service/cases/SC-DEMO-CT-001",
} as const;

export const publicPages = [
  { page: "home", path: "/", label: "Home", title: "Evidanor | Hospital Engineering Operations" },
  { page: "workflow", path: "/engineering-workflow", label: "Engineering workflow", title: "Engineering Workflow | Evidanor" },
  { page: "service", path: "/service-coordination", label: "Service coordination", title: "Service Coordination | Evidanor" },
  { page: "equipment", path: "/equipment", label: "Equipment", title: "Equipment Coverage | Evidanor" },
  { page: "demo", path: "/explore-demo", label: "Demo guide", title: "Demo Guide | Evidanor" },
] as const;

export type PublicPage = (typeof publicPages)[number]["page"];
