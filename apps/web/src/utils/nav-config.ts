export interface NavItem {
  label: string;
  href: string;
}

export const NAV_CONFIG: Record<string, NavItem[]> = {
  "/": [
    { label: "Experience", href: "#experience" },
    { label: "Principles", href: "#why" },
    { label: "Outcomes", href: "#outcomes" },
    { label: "Stats", href: "#stats" },
    { label: "FAQ", href: "#faq" },
    { label: "Get Started", href: "#cta" },
  ],

  "/about": [
    { label: "Mission", href: "#mission" },
    { label: "The Problem", href: "#problem" },
    { label: "Stakeholders", href: "#who-we-serve" },
    { label: "Principles", href: "#principles" },
  ],
  "/contact": [
    { label: "Support", href: "#support" },
    { label: "Partnerships", href: "#partnerships" },
  ],
};


export const GLOBAL_NAV = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
