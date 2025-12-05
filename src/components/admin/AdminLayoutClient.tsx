"use client";

import { useState, useCallback } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { ErrorBoundary } from "@/components/admin/ErrorBoundary";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onMenuClick={handleMenuToggle} />
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
        <main className="flex-1 p-4 pt-20 lg:p-8 lg:pt-24 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
