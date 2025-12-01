"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut, Store, Menu } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { signOut, state } = useAuth();
  const user = state.user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">Foal Rider</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <Link href="/" target="_blank" className="hidden sm:block">
            <Button variant="outline" size="sm">
              View Store
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden md:inline text-gray-700">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
