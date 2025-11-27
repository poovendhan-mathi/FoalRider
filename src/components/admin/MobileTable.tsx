"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MobileTableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MobileTable wrapper component
 * Makes tables horizontally scrollable on mobile devices
 * Maintains full table layout on desktop
 */
export function MobileTable({ children, className }: MobileTableProps) {
  return (
    <div className={cn("overflow-x-auto -mx-4 sm:mx-0", className)}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

interface MobileCardTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

/**
 * MobileCardTable component
 * Displays as a table on desktop, cards on mobile
 * Better UX for complex data on small screens
 */
export function MobileCardTable<T extends { id?: string | number }>({
  data,
  columns,
  onRowClick,
  emptyMessage = "No data available",
  className,
}: MobileCardTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
    );
  }

  const getValue = (item: T, key: string | keyof T): unknown => {
    if (typeof key === "string" && key.includes(".")) {
      const keys = key.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = item;
      for (const k of keys) {
        value = value?.[k];
      }
      return value;
    }
    return item[key as keyof T];
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className={cn("min-w-full divide-y divide-gray-200", className)}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <tr
                key={item.id || rowIndex}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  onRowClick && "cursor-pointer hover:bg-gray-50 transition-colors"
                )}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(item)
                      : String(getValue(item, col.key) || "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => onRowClick?.(item)}
            className={cn(
              "bg-white p-4 rounded-lg shadow border border-gray-200",
              onRowClick && "cursor-pointer active:bg-gray-50"
            )}
          >
            {columns.map((col, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  "flex justify-between items-start py-2",
                  colIndex !== columns.length - 1 && "border-b border-gray-100"
                )}
              >
                <span className="text-sm font-medium text-gray-500 shrink-0 w-1/3">
                  {col.label}
                </span>
                <span className={cn("text-sm text-gray-900 text-right flex-1", col.className)}>
                  {col.render
                    ? col.render(item)
                    : String(getValue(item, col.key) || "-")}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
