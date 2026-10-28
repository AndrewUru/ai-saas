import DashboardShell from "@/components/ui/DashboardShell";
import { isSuperAdmin } from "@/lib/auth/requireSuperAdmin";
import { createServer } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardShell data-oid="7ufeqnu" showAdminLink={isSuperAdmin(user)}>
      {children}
    </DashboardShell>
  );
}
