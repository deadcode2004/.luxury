"use client";

import React from "react";

type PaginationProps = {
  showing: number;
  total: number;
  label?: string;
};

export default function Pagination({ showing, total, label }: PaginationProps) {
  return (
    <p className="text-sm text-gray-400">
      {label ?? `Showing ${showing} of ${total}`}
    </p>
  );
}
