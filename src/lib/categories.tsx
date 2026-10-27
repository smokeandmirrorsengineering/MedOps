import { Gauge, Snowflake, Stethoscope, Wind, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categories } from "../domain/types";
import type { Category } from "../domain/types";

export const categoryMetadata: Record<
  Category,
  { slug: string; label: string; icon: LucideIcon }
> = {
  "HVAC & Operating Theatre Infrastructure": {
    slug: "hvac",
    label: "HVAC & theatre",
    icon: Wind,
  },
  "Medical Gas Systems": { slug: "gas", label: "Medical gas", icon: Gauge },
  "Refrigeration & Cold Storage": {
    slug: "cold",
    label: "Cold storage",
    icon: Snowflake,
  },
  "Electrical & Backup Power": {
    slug: "power",
    label: "Electrical & power",
    icon: Zap,
  },
  "Laboratory Equipment": {
    slug: "lab",
    label: "Laboratory",
    icon: Stethoscope,
  },
};

export function categoryFromSlug(slug: string): Category | "" {
  return (
    categories.find((category) => categoryMetadata[category].slug === slug) ??
    ""
  );
}
