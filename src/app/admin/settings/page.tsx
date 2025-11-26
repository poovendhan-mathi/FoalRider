import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Store,
  CreditCard,
  Mail,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
            <CardDescription>Basic store details and branding</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Store name and description</li>
              <li>• Logo and favicon</li>
              <li>• Contact information</li>
              <li>• Business hours</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>Payment gateway configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Stripe API keys</li>
              <li>• Payment methods</li>
              <li>• Currency settings</li>
              <li>• Tax configuration</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Customize customer email notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Order confirmation emails</li>
              <li>• Shipping notifications</li>
              <li>• Password reset emails</li>
              <li>• Marketing emails</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Shipping & Delivery
            </CardTitle>
            <CardDescription>Configure shipping options</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Shipping zones and rates</li>
              <li>• Free shipping thresholds</li>
              <li>• Delivery time estimates</li>
              <li>• Carrier integrations</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Settings management interface is in development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Currently, most settings are managed through environment variables
            and the Supabase dashboard. A comprehensive settings interface will
            be added in future updates.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Current Configuration
            </h4>
            <p className="text-sm text-blue-800">
              Store settings are configured in your <code>.env.local</code> file
              and Supabase project settings. Refer to the documentation for
              detailed configuration instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
