"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

interface SettingsData {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  currency: "INR" | "USD";
  tax_rate: number;
  shipping_fee: number;
  free_shipping_threshold: number;
  enable_notifications: boolean;
  enable_reviews: boolean;
  enable_wishlist: boolean;
  maintenance_mode: boolean;
}

export default function SettingsForm() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings updated successfully",
        });
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-500">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Basic information about your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name</Label>
              <Input
                id="store_name"
                value={settings.store_name}
                onChange={(e) =>
                  setSettings({ ...settings, store_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_email">Store Email</Label>
              <Input
                id="store_email"
                type="email"
                value={settings.store_email}
                onChange={(e) =>
                  setSettings({ ...settings, store_email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store_phone">Store Phone</Label>
              <Input
                id="store_phone"
                value={settings.store_phone}
                onChange={(e) =>
                  setSettings({ ...settings, store_phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    currency: e.target.value as "INR" | "USD",
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="store_address">Store Address</Label>
            <Textarea
              id="store_address"
              value={settings.store_address}
              onChange={(e) =>
                setSettings({ ...settings, store_address: e.target.value })
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Shipping */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Shipping</CardTitle>
          <CardDescription>
            Configure pricing and shipping options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.tax_rate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tax_rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_fee">Shipping Fee (₹)</Label>
              <Input
                id="shipping_fee"
                type="number"
                min="0"
                step="1"
                value={settings.shipping_fee}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping_fee: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="free_shipping_threshold">
                Free Shipping Above (₹)
              </Label>
              <Input
                id="free_shipping_threshold"
                type="number"
                min="0"
                step="1"
                value={settings.free_shipping_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    free_shipping_threshold: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Enable or disable store features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable_notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications to customers
              </p>
            </div>
            <Switch
              id="enable_notifications"
              checked={settings.enable_notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enable_notifications: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable_reviews">Product Reviews</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to leave reviews on products
              </p>
            </div>
            <Switch
              id="enable_reviews"
              checked={settings.enable_reviews}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enable_reviews: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable_wishlist">Wishlist</Label>
              <p className="text-sm text-muted-foreground">
                Enable wishlist functionality
              </p>
            </div>
            <Switch
              id="enable_wishlist"
              checked={settings.enable_wishlist}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enable_wishlist: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Put the store in maintenance mode (customers cannot place
                orders)
              </p>
            </div>
            <Switch
              id="maintenance_mode"
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, maintenance_mode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
