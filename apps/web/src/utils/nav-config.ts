export interface NavItem {
  label: string;
  href: string;
}

export const NAV_CONFIG: Record<string, NavItem[]> = {
  "/": [
    { label: "Experience", href: "#experience" },
    { label: "Principles", href: "#why" },
    { label: "Stats", href: "#stats" },
    { label: "Outcomes", href: "#outcomes" },
    { label: "FAQ", href: "#faq" },
    { label: "Get Started", href: "#cta" },
  ],

  "/about": [
    { label: "Mission", href: "#mission" },
    { label: "Problem", href: "#problem" },
    { label: "Who We Serve", href: "#who-we-serve" },
    { label: "Principles", href: "#principles" },
  ],
  "/contact": [
    { label: "Support", href: "#support" },
    { label: "Partnerships", href: "#partnerships" },
  ],
  "/privacy": [
    { label: "Collection", href: "#collection" },
    { label: "Usage", href: "#usage" },
    { label: "Access", href: "#access" },
    { label: "Security", href: "#security" },
    { label: "Rights", href: "#rights" },
    { label: "Contact", href: "#contact" },
  ],
  "/terms": [
    { label: "Eligibility", href: "#eligibility" },
    { label: "Service", href: "#service" },
    { label: "Conduct", href: "#conduct" },
    { label: "Billing", href: "#billing" },
    { label: "Emergency", href: "#emergency" },
    { label: "Legal", href: "#legal" },
    { label: "Contact", href: "#contact" },
  ],
  "/security": [
    { label: "Data Protection", href: "#protection" },
    { label: "Encryption", href: "#encryption" },
    { label: "Access Control", href: "#access" },
    { label: "Compliance", href: "#compliance" },
    { label: "Infrastructure", href: "#infra" },
    { label: "Contact", href: "#contact" },
  ],
};


export const GLOBAL_NAV = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
