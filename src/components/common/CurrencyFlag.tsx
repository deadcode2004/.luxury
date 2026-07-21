import React from "react";
import { cn } from "@/lib/cn";
import type { CurrencyCode } from "@/contexts/CurrencyContext";
import { getCurrencyMeta } from "@/lib/currency/meta";

type CurrencyFlagProps = {
  code: CurrencyCode;
  className?: string;
  title?: string;
};

/** Inline SVG flags — reliable on Windows Chrome (emoji flags do not render there). */
function FlagSvg({ country }: { country: "eg" | "sa" | "us" }) {
  if (country === "eg") {
    return (
      <svg viewBox="0 0 36 24" className="h-full w-full" aria-hidden>
        <rect width="36" height="8" y="0" fill="#CE1126" />
        <rect width="36" height="8" y="8" fill="#FFFFFF" />
        <rect width="36" height="8" y="16" fill="#000000" />
        {/* Eagle of Saladin (simplified gold emblem) */}
        <path
          d="M18 9.2c-1.8 0-2.8 1.1-2.8 2.4 0 1.6 1.1 2.5 2.8 3.6 1.7-1.1 2.8-2 2.8-3.6 0-1.3-1-2.4-2.8-2.4z"
          fill="#C09300"
        />
        <rect x="16.6" y="14.8" width="2.8" height="1.3" rx="0.3" fill="#C09300" />
      </svg>
    );
  }

  if (country === "sa") {
    return (
      <svg viewBox="0 0 36 24" className="h-full w-full" aria-hidden>
        <rect width="36" height="24" fill="#165D31" />
        {/* White calligraphy band (geometric stand-in) */}
        <rect x="7" y="7.2" width="22" height="1.5" rx="0.6" fill="#FFFFFF" />
        <rect x="9.5" y="10" width="17" height="1.3" rx="0.5" fill="#FFFFFF" />
        {/* Sword */}
        <path
          d="M8 15.8h17.5l1.8 1.1H9.2c-1.1 0-1.8-.5-1.8-1.1 0-.4.4-.9.6-1z"
          fill="#FFFFFF"
        />
        <circle cx="26.8" cy="16.4" r="1.3" fill="#FFFFFF" />
      </svg>
    );
  }

  // US
  return (
    <svg viewBox="0 0 36 24" className="h-full w-full" aria-hidden>
      <rect width="36" height="24" fill="#FFFFFF" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 24) / 13} width="36" height={24 / 13} fill="#B22234" />
      ))}
      <rect width="14.4" height={(7 * 24) / 13} fill="#3C3B6E" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={1.55 + col * 2.8}
            cy={1.45 + row * 2.95}
            r="0.5"
            fill="#FFFFFF"
          />
        ))
      )}
    </svg>
  );
}

export default function CurrencyFlag({ code, className, title }: CurrencyFlagProps) {
  const meta = getCurrencyMeta(code);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-[3px] border border-black/10 bg-white shadow-sm",
        "h-4 w-6",
        className
      )}
      title={title ?? meta.code}
      aria-hidden
    >
      <FlagSvg country={meta.country} />
    </span>
  );
}
