"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2, UserRound } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";
import {
  AVATAR_ACCEPT,
  compressAvatarImage,
  validateAvatarFile,
} from "@/lib/images/compressImage";

type AvatarUploaderProps = {
  fallbackLabel?: string;
  className?: string;
  size?: "md" | "lg";
  /** Stage preview only; parent uploads later (e.g. register). */
  deferUpload?: boolean;
  onPendingChange?: (file: File | null) => void;
};

export default function AvatarUploader({
  fallbackLabel = "",
  className,
  size = "lg",
  deferUpload = false,
  onPendingChange,
}: AvatarUploaderProps) {
  const { language } = useLanguage();
  const { user, uploadAvatar, removeAvatar } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savedAvatar = user?.avatar || null;
  const displaySrc = previewUrl || savedAvatar;
  const initial =
    (fallbackLabel || user?.first_name || user?.email || "?").trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearPending = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    onPendingChange?.(null);
  };

  const validationMessage = (code: "type" | "size" | "load") => {
    if (code === "type") {
      return language === "ar"
        ? "صيغة غير مدعومة. استخدم JPEG أو PNG أو WebP فقط."
        : "Unsupported format. Use JPEG, PNG, or WebP only.";
    }
    if (code === "size") {
      return language === "ar" ? "الحد الأقصى لحجم الصورة 5 ميجابايت." : "Maximum image size is 5 MB.";
    }
    return language === "ar" ? "تعذر قراءة الصورة." : "Could not read the image.";
  };

  const onPick = async (file: File | null) => {
    setError(null);
    if (!file) return;

    const invalid = validateAvatarFile(file);
    if (invalid) {
      setError(validationMessage(invalid));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setBusy(true);
    try {
      let readyFile = file;
      try {
        readyFile = await compressAvatarImage(file);
      } catch {
        // Fall back to the original file if canvas compression fails.
        readyFile = file;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const nextPreview = URL.createObjectURL(readyFile);
      setPreviewUrl(nextPreview);
      setPendingFile(readyFile);
      onPendingChange?.(readyFile);

      if (deferUpload) {
        return;
      }

      const ok = await uploadAvatar(readyFile);
      if (ok) {
        URL.revokeObjectURL(nextPreview);
        setPreviewUrl(null);
        setPendingFile(null);
        onPendingChange?.(null);
      }
    } catch {
      setError(validationMessage("load"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onRemoveSaved = async () => {
    setError(null);
    if (pendingFile || previewUrl) {
      clearPending();
      if (!savedAvatar) return;
    }
    if (!savedAvatar) return;
    setBusy(true);
    try {
      await removeAvatar();
    } finally {
      setBusy(false);
    }
  };

  const dim = size === "lg" ? "h-24 w-24" : "h-16 w-16";
  const badge = size === "lg" ? "h-8 w-8" : "h-7 w-7";
  const isWorking = busy;

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-4", className)}>
      <div className="relative shrink-0">
        <div
          className={cn(
            "relative overflow-hidden rounded-full bg-gradient-to-br from-primary/15 to-accent/25 ring-2 ring-accent/25",
            dim
          )}
        >
          {displaySrc ? (
            displaySrc.startsWith("blob:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displaySrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Image
                src={displaySrc}
                alt=""
                fill
                sizes={size === "lg" ? "96px" : "64px"}
                className="object-cover"
                unoptimized
              />
            )
          ) : fallbackLabel ? (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-secondary/70">
              {initial}
            </span>
          ) : (
            <span className="flex h-full w-full items-center justify-center text-secondary/55">
              <UserRound size={size === "lg" ? 36 : 24} />
            </span>
          )}
          {isWorking ? (
            <span className="absolute inset-0 flex items-center justify-center bg-secondary/40 backdrop-blur-[1px]">
              <Loader2 className="animate-spin text-background" size={22} />
            </span>
          ) : null}
        </div>

        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={AVATAR_ACCEPT}
          className="hidden"
          onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          disabled={isWorking}
          onClick={() => inputRef.current?.click()}
          aria-label={
            displaySrc
              ? language === "ar"
                ? "تغيير الصورة"
                : "Change photo"
              : language === "ar"
                ? "رفع صورة"
                : "Upload photo"
          }
          title={
            displaySrc
              ? language === "ar"
                ? "تغيير الصورة"
                : "Change photo"
              : language === "ar"
                ? "رفع صورة"
                : "Upload photo"
          }
          className={cn(
            "absolute -bottom-0.5 -end-0.5 z-10 inline-flex items-center justify-center rounded-full",
            "border-2 border-background bg-secondary text-background shadow-soft",
            "transition-transform hover:scale-105 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "disabled:opacity-50",
            badge
          )}
        >
          <Camera size={size === "lg" ? 14 : 12} />
        </button>

        {(savedAvatar || (deferUpload && pendingFile)) && !isWorking ? (
          <button
            type="button"
            disabled={isWorking}
            onClick={() => void onRemoveSaved()}
            aria-label={
              deferUpload && pendingFile
                ? language === "ar"
                  ? "إلغاء المعاينة"
                  : "Discard preview"
                : language === "ar"
                  ? "حذف الصورة"
                  : "Remove photo"
            }
            title={
              deferUpload && pendingFile
                ? language === "ar"
                  ? "إلغاء المعاينة"
                  : "Discard preview"
                : language === "ar"
                  ? "حذف الصورة"
                  : "Remove photo"
            }
            className={cn(
              "absolute -top-0.5 -start-0.5 z-10 inline-flex items-center justify-center rounded-full",
              "border-2 border-background bg-background text-red-600 shadow-soft",
              "transition-transform hover:scale-105 hover:bg-red-50 active:scale-95 disabled:opacity-50",
              badge
            )}
          >
            <Trash2 size={size === "lg" ? 13 : 11} />
          </button>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold text-secondary">
          {language === "ar" ? "الصورة الشخصية" : "Profile photo"}
        </p>
        <p className="text-xs text-secondary/50 leading-relaxed">
          {language === "ar"
            ? "اضغط أيقونة الكاميرا لرفع الصورة. JPEG أو PNG أو WebP — حتى 5 ميجابايت."
            : "Tap the camera icon to upload. JPEG, PNG, or WebP — up to 5 MB."}
        </p>
        {deferUpload && pendingFile ? (
          <p className="text-xs font-medium text-primary pt-1">
            {language === "ar"
              ? "ستُحفظ الصورة بعد إنشاء الحساب."
              : "Photo will be saved after account creation."}
          </p>
        ) : null}
        {error ? <p className="text-xs text-red-500 pt-1">{error}</p> : null}
      </div>
    </div>
  );
}
