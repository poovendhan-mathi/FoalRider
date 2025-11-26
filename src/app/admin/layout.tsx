import { requireAdmin } from "@/lib/auth/admin";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify admin access on server side
  await requireAdmin();

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
