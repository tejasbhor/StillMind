import AppShell from "@/components/layout/AppShell";
import { STUDENT_NAV_SECTIONS } from "@/utils/portal-nav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sections={STUDENT_NAV_SECTIONS} title="Student Portal" portal="student">
      {children}
    </AppShell>
  );
}
