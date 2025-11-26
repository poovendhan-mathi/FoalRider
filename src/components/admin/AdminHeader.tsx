"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Store } from "lucide-react";

export default function AdminHeader() {
  const { signOut, user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Foal Rider</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm">
              View Store
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-700">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
