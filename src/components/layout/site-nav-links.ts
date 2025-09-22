export type NavItem = {
  label: string;
  href: string;
  description?: string;
  items?: Array<{
    label: string;
    href: string;
    description?: string;
  }>;
};

export const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Pre-Built PCs",
    href: "/prebuilt",
    description: "Shop expertly curated rigs ready to deploy right away.",
  },
  {
    label: "Custom Build",
    href: "/custom-builder",
    description: "Craft a bespoke PC with guidance and live compatibility checks.",
  },
  {
    label: "Services",
    href: "/support",
    items: [
      {
        label: "Support & FAQ",
        href: "/support",
        description: "Warranty, troubleshooting, and post-purchase resources.",
      },
      {
        label: "Contact",
        href: "/contact",
        description: "Talk with sales or get build advice from our team.",
      },
    ],
  },
  {
    label: "About",
    href: "/about",
    description: "Get to know the mission, values, and experts behind EZComputers.",
  },
];
