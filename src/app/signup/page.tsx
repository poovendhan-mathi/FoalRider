"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Sign up the user
      await signUp(email, password);

      // Update the user's profile with full name and phone
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Update profile in the profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            phone: phone || null,
          })
          .eq("id", user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to create account");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
        <Card className="w-full max-w-md rounded-2xl border-[#E5E5E5]">
          <CardHeader className="text-center">
            <CardTitle className="font-['Playfair_Display'] text-2xl font-bold text-black">
              Check your email
            </CardTitle>
            <CardDescription className="font-['Montserrat'] text-[#9CA3AF]">
              We&apos;ve sent you a confirmation email. Please verify your
              account to continue.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <Card className="w-full max-w-md rounded-2xl border-[#E5E5E5]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-['Playfair_Display'] text-3xl font-bold text-black">
            Create an account
          </CardTitle>
          <CardDescription className="font-['Montserrat'] text-[#9CA3AF]">
            Enter your details to create your Foal Rider account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl font-['Montserrat']">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="font-['Montserrat'] text-black"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-['Montserrat'] text-black">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-['Montserrat'] text-black">
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-['Montserrat'] text-black"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="font-['Montserrat'] text-black"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="rounded-xl"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              variant="gold"
              className="w-full font-['Montserrat']"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="font-['Montserrat'] text-sm text-[#9CA3AF] text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#C5A572] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
