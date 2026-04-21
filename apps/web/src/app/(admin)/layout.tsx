import AppShell from "@/components/layout/AppShell";
import { ADMIN_NAV_SECTIONS } from "@/utils/portal-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sections={ADMIN_NAV_SECTIONS} title="Admin Console" portal="admin">
      {children}
    </AppShell>
  );
}

