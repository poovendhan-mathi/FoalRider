"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useSearchParams } from "next/navigation";
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
import { toast } from "sonner";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const searchParams = useSearchParams();

  // Check for verification errors or messages
  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error === "verification_failed") {
      toast.error(message || "Email verification failed. Please try again.");
    } else if (error === "no_code") {
      toast.error("Invalid verification link.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("[Login] Attempting to sign in with email:", email);
      await signIn(email, password);
      console.log("[Login] Sign in success, waiting for session sync...");

      // Wait a bit for session to sync across tabs
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("[Login] Redirecting to profile");

      // Use window.location for a full page reload to ensure middleware runs
      window.location.href = "/profile";
    } catch (err: unknown) {
      console.error("[Login] Sign in error:", err);
      setError((err as Error)?.message || "Failed to sign in");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <Card className="w-full max-w-md rounded-2xl border-[#E5E5E5]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-['Playfair_Display'] text-3xl font-bold text-black">
            Welcome back
          </CardTitle>
          <CardDescription className="font-['Montserrat'] text-[#9CA3AF]">
            Enter your credentials to sign in to your account
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
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="font-['Montserrat'] text-black"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="font-['Montserrat'] text-sm text-[#C5A572] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="font-['Montserrat'] text-sm text-[#9CA3AF] text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#C5A572] hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A572]"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
