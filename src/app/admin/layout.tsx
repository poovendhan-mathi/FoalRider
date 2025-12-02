import { requireAdmin } from "@/lib/auth/admin";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

// Force dynamic rendering for all admin routes since they use cookies
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify admin access on server side
  await requireAdmin();

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
