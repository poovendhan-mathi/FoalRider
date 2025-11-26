import { requireAdmin } from "@/lib/auth/admin";
import ProductsClientPage from "./page-client";

export default async function ProductsPage() {
  await requireAdmin();

  return <ProductsClientPage />;
}
