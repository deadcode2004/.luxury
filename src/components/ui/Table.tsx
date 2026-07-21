"use client";

import React from "react";
import { cn } from "@/lib/cn";
import Card from "./Card";

type TableProps = {
  headers: React.ReactNode[];
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  minWidth?: string;
  className?: string;
  /** When false, render table markup without the outer Card shell. */
  framed?: boolean;
};

export function TableToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function Table({
  headers,
  children,
  toolbar,
  footer,
  minWidth = "800px",
  className,
  framed = true,
}: TableProps) {
  const content = (
    <>
      {toolbar}
      <div className="overflow-x-auto">
        <table className="w-full text-start" style={{ minWidth }}>
          <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={cn(
                    "font-bold py-3 px-6 text-start",
                    index === headers.length - 1 && "text-center"
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">{children}</tbody>
        </table>
      </div>
      {footer != null && (
        <div className="p-4 border-t border-gray-100 flex justify-center">{footer}</div>
      )}
    </>
  );

  if (!framed) {
    return <div className={cn("flex flex-col", className)}>{content}</div>;
  }

  return (
    <Card variant="panel" padding="none" className={cn("flex flex-col", className)}>
      {content}
    </Card>
  );
}

export function TableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("hover:bg-gray-50 transition-colors", className)}>{children}</tr>
  );
}

export function TableCell({
  children,
  className,
  align = "start",
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "py-4 px-6",
        align === "center" && "text-center",
        align === "end" && "text-end",
        className
      )}
    >
      {children}
    </td>
  );
}
