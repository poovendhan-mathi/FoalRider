import { requireAdmin } from "@/lib/auth/admin";
import CategoriesClientPage from "./page-client";

export default async function CategoriesPage() {
  await requireAdmin();

  return <CategoriesClientPage />;
}
