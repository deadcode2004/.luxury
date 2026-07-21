"use client";

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, UserRound } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { displayPersonName } from "@/lib/i18n/localeText";
import { cn } from "@/lib/cn";
import AccountMenuPanel from "@/components/common/AccountMenuPanel";

type AccountMenuProps = {
  inverted?: boolean;
  onLogoutRequest: () => void;
};

function useFineHover() {
  const [fineHover, setFineHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFineHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fineHover;
}

/**
 * Desktop account control:
 * - Hover opens on fine-pointer desktops
 * - Click/tap toggles everywhere (also supports keyboard)
 * Tablet/mobile use the drawer accordion instead (see Header).
 */
export default function AccountMenu({ inverted = false, onLogoutRequest }: AccountMenuProps) {
  const { language, dir } = useLanguage();
  const { user, isAuthenticated, ready } = useAuth();
  const fineHover = useFineHover();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const displayName = displayPersonName(user, language, "");
  const label = language === "ar" ? "الحساب" : "Account";

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(false);
    setPinned(false);
  }, []);

  const scheduleClose = useCallback(() => {
    if (pinned) return;
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 120);
  }, [pinned]);

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        (rootRef.current?.querySelector("button[data-account-trigger]") as HTMLButtonElement | null)?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  // Keep panel inside the viewport (RTL/LTR safe).
  useLayoutEffect(() => {
    if (!open || !panelRef.current || !rootRef.current) return;
    const panel = panelRef.current;
    const margin = 12;
    panel.style.left = "";
    panel.style.right = "";
    panel.style.transform = "";

    const rect = panel.getBoundingClientRect();
    if (rect.right > window.innerWidth - margin) {
      panel.style.right = "0px";
      panel.style.left = "auto";
    }
    if (rect.left < margin) {
      panel.style.left = "0px";
      panel.style.right = "auto";
    }
  }, [open, dir, language, isAuthenticated]);

  const onTriggerClick = () => {
    if (open && pinned) {
      closeMenu();
      return;
    }
    setPinned(true);
    openMenu();
  };

  return (
    <div
      ref={rootRef}
      className="relative hidden lg:flex h-full items-center"
      onMouseEnter={() => {
        if (fineHover) openMenu();
      }}
      onMouseLeave={() => {
        if (fineHover) scheduleClose();
      }}
    >
      <button
        type="button"
        data-account-trigger
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={onTriggerClick}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setPinned(true);
            openMenu();
            requestAnimationFrame(() => {
              panelRef.current
                ?.querySelector<HTMLElement>('[role="menuitem"]')
                ?.focus();
            });
          }
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl p-1.5 pe-2 transition-all duration-150 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          inverted
            ? "hover:bg-white/10 hover:text-white text-background"
            : "hover:bg-surface/60 hover:text-primary text-inherit",
          open && (inverted ? "bg-white/15 text-white" : "bg-surface/70 text-primary")
        )}
      >
        {ready && isAuthenticated && user ? (
          <span className="relative h-7 w-7 overflow-hidden rounded-full ring-1 ring-accent/40">
            {user.avatar ? (
              <Image
                key={user.avatar}
                src={user.avatar}
                alt=""
                fill
                sizes="28px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/30 text-[10px] font-bold text-secondary">
                {(displayName || user.email).slice(0, 1).toUpperCase()}
              </span>
            )}
          </span>
        ) : (
          <UserRound size={18} className="mx-0.5" />
        )}
        <ChevronDown
          size={14}
          className={cn(
            "opacity-70 transition-transform duration-200 ease-out",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        id={menuId}
        ref={panelRef}
        className={cn(
          "absolute top-[calc(100%+0.35rem)] z-50 w-[min(18.5rem,calc(100vw-1.5rem))]",
          dir === "rtl" ? "left-0" : "right-0",
          "origin-top transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          open
            ? "pointer-events-auto visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1.5 opacity-0"
        )}
        onMouseEnter={() => {
          if (fineHover) {
            clearCloseTimer();
            openMenu();
          }
        }}
        onMouseLeave={() => {
          if (fineHover) scheduleClose();
        }}
      >
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-surface/55 bg-background/95 shadow-floating backdrop-blur-xl",
            "ring-1 ring-black/[0.03]"
          )}
        >
          <AccountMenuPanel
            onNavigate={closeMenu}
            onLogout={() => {
              closeMenu();
              onLogoutRequest();
            }}
          />
        </div>
      </div>
    </div>
  );
}
