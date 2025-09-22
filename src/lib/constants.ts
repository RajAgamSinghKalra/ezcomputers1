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
export const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1626218174358-7769486c4b79?auto=format&fit=crop&w=1200&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtaW5nJTIwcGN8ZW58MHx8MHx8fDA%3D";
export const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1603983732011-caaf6ca67a3e?auto=format&fit=crop&w=1600&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z2FtaW5nJTIwcGN8ZW58MHx8MHx8fDA%3D";

