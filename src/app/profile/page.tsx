"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "@/contexts/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Package,
  MapPin,
  Settings,
  Camera,
  Mail,
  Calendar,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

interface Profile {
  full_name?: string;
  avatar_url?: string;
  role?: string;
  phone?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  currency: string;
  items_count: number;
}

interface Address {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses] = useState<Address[]>([]); // TODO: Implement addresses feature
  const [activeTab, setActiveTab] = useState("overview");

  // Debug logging helper
  const log = (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[ProfilePage]", ...args);
    }
  };

  // Redirect to login if not loading and no user
  useEffect(() => {
    log("Session state:", { loading, user });
    if (!loading && !user) {
      log("No user found, redirecting to /login");
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Show verification success message
  useEffect(() => {
    log("Search params:", searchParams.toString());
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! Welcome to Foal Rider.");
      window.history.replaceState({}, "", "/profile");
    }
  }, [searchParams]);

  // Load profile data when user is available
  useEffect(() => {
    log("User effect triggered", user);
    if (user) {
      log("User present, loading profile data");
      loadProfileData();
    }
    // Check for hash navigation
    const hash = window.location.hash.replace("#", "");
    if (hash === "settings") {
      setActiveTab("settings");
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) {
      log("loadProfileData called with no user");
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      log("🔍 Loading profile for user:", user.id);
      // Load profile with timeout
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      log("📊 Profile query result:", { profileData, profileError });
      if (profileError) {
        log("❌ Profile load error:", profileError);
        toast.error("Failed to load profile: " + profileError.message);
      } else if (profileData) {
        log("✅ Profile loaded:", profileData);
        setProfile(profileData);
      } else {
        log("⚠️ No profile data returned");
      }
      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, created_at, status, total_amount, currency")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (ordersError) {
        log("❌ Orders load error:", ordersError);
      } else if (ordersData) {
        log("✅ Orders loaded:", ordersData.length);
        setOrders(
          ordersData.map(
            (order: {
              id: string;
              created_at: string;
              status: string;
              total_amount: number;
              currency: string;
            }) => ({
              id: order.id,
              created_at: order.created_at,
              status: order.status,
              total: order.total_amount,
              currency: order.currency,
              items_count: 0, // Can be updated later with proper query
            })
          )
        );
      }
    } catch (error) {
      log("❌ Error loading profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      log("✅ Profile loading complete");
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();

    // Clear all storage
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }

    await supabase.auth.signOut();

    // Redirect to home
    router.push("/");
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      toast.loading("Uploading avatar...");

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      toast.dismiss();
      toast.success("Avatar updated successfully!");
    } catch (error: unknown) {
      toast.dismiss();
      console.error("Avatar upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to upload avatar: " + errorMessage);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const supabase = getSupabaseBrowserClient();

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.get("full_name") as string,
          phone: formData.get("phone") as string,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Profile update error:", error);
        toast.error("Failed to update profile: " + error.message);
      } else {
        toast.success("Profile updated successfully");
        await loadProfileData();
      }
    } catch (error: unknown) {
      console.error("Profile update exception:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Failed to update profile: " + errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  if (!user) {
    // While redirecting, render nothing
    return null;
  }

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user.email?.[0].toUpperCase() ||
    "U";

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  // Check role from profiles table - single source of truth
  const isAdmin = profile?.role === "admin";

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A572] mx-auto mb-4"></div>
          <p className="font-['Montserrat'] text-[#4B5563]">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Show message if no user (while redirecting)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <p className="font-['Montserrat'] text-[#4B5563]">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-[#E5E5E5]">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url} alt={displayName} />
                <AvatarFallback className="bg-[#C5A572] text-white text-2xl font-['Playfair_Display']">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 cursor-pointer"
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
                type="button"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                {isAdmin && (
                  <Badge
                    variant="secondary"
                    className="bg-[#C5A572] text-white"
                  >
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since{" "}
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="h-4 w-4 mr-2" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{orders.length}</div>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$0.00</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Across all orders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Saved Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{addresses.length}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Shipping addresses
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest purchase history</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Button asChild>
                      <Link href="/products">Start Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Orders will be mapped here when implemented */}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View and track all your orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start shopping to see your orders here
                    </p>
                    <Button size="lg" asChild>
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Order list will be implemented here */}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shipping Addresses</CardTitle>
                    <CardDescription>
                      Manage your delivery addresses
                    </CardDescription>
                  </div>
                  <Button>
                    <MapPin className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No saved addresses
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add a shipping address for faster checkout
                    </p>
                    <Button size="lg">Add Your First Address</Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Address cards will be mapped here */}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      defaultValue={profile?.full_name || ""}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Contact support to change your email address
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={profile?.phone || ""}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <Separator />

                  <Button
                    type="submit"
                    className="bg-[#C5A572] hover:bg-[#B89968]"
                  >
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Change Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
