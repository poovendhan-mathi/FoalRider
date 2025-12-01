import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your store settings and preferences
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <SettingsForm />
    </div>
  );
}
