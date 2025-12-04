"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: {
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    page?: string;
  };
}

export function ProductPagination({
  currentPage,
  totalPages,
  searchParams,
}: ProductPaginationProps) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();

    // Preserve existing search params
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
    if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
    if (searchParams.search) params.set("search", searchParams.search);

    // Set the page
    params.set("page", page.toString());

    return `/products?${params.toString()}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-gray-100"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-none border-gray-200"
        disabled={currentPage <= 1}
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isActive ? "default" : "ghost"}
              className={`h-10 w-10 rounded-none ${
                isActive
                  ? "bg-black text-white hover:bg-black"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              asChild={!isActive}
            >
              {isActive ? (
                <span>{pageNum}</span>
              ) : (
                <Link
                  href={createPageUrl(pageNum)}
                  aria-label={`Page ${pageNum}`}
                >
                  {pageNum}
                </Link>
              )}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-none border-gray-200"
        disabled={currentPage >= totalPages}
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  );
}
