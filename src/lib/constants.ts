import { ProductCategory } from "@prisma/client";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  GAMING: "Gaming",
  CREATOR: "Creator",
  WORKSTATION: "Workstation",
  COMPACT: "Compact",
  ENTERPRISE: "Enterprise",
  HOME_OFFICE: "Home Office",
};

export const CATEGORY_BLURBS: Record<ProductCategory, string> = {
  GAMING: "Max FPS, ray tracing, esports-tuned responsiveness.",
  CREATOR: "Render, edit, and stream without compromise.",
  WORKSTATION: "Certified builds for engineering and data workloads.",
  COMPACT: "Small footprint, no performance compromises.",
  ENTERPRISE: "Fleet-ready systems for IT-managed deployments.",
  HOME_OFFICE: "Reliable productivity rigs for day-to-day excellence.",
};
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ezcomputers.com";
export const DEFAULT_OG_IMAGE = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80";

