import AppShell from "@/components/layout/AppShell";
import { COUNSELOR_NAV_SECTIONS } from "@/utils/portal-nav";

export default function CounselorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sections={COUNSELOR_NAV_SECTIONS} title="Counselor Portal" portal="counselor">
      {children}
    </AppShell>
  );
}

