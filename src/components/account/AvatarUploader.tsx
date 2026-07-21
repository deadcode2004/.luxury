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
  const { user, loading, uploadAvatar, removeAvatar } = useAuth();
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
        ? "صيغة غير مدعومة. استخدم JPEG أو PNG أو WebP أو GIF."
        : "Unsupported format. Use JPEG, PNG, WebP, or GIF.";
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
      const compressed = await compressAvatarImage(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const nextPreview = URL.createObjectURL(compressed);
      setPreviewUrl(nextPreview);
      setPendingFile(compressed);
      onPendingChange?.(compressed);
    } catch {
      setError(validationMessage("load"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const savePending = async () => {
    if (!pendingFile) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await uploadAvatar(pendingFile);
      if (ok) clearPending();
    } finally {
      setBusy(false);
    }
  };

  const onRemoveSaved = async () => {
    setError(null);
    setBusy(true);
    try {
      await removeAvatar();
    } finally {
      setBusy(false);
    }
  };

  const dim = size === "lg" ? "h-24 w-24" : "h-16 w-16";
  const isWorking = busy || loading;

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-4", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/15 to-accent/25 ring-2 ring-accent/25",
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

      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-semibold text-secondary">
          {language === "ar" ? "الصورة الشخصية" : "Profile photo"}
        </p>
        <p className="text-xs text-secondary/50 leading-relaxed">
          {language === "ar"
            ? "JPEG أو PNG أو WebP أو GIF — حتى 5 ميجابايت. يتم ضغط الصورة تلقائياً."
            : "JPEG, PNG, WebP, or GIF — up to 5 MB. Images are compressed automatically."}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
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
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-surface/70 bg-background px-3 py-2",
              "text-xs font-bold text-secondary transition-colors",
              "hover:border-primary/30 hover:bg-primary/[0.05] hover:text-primary",
              "disabled:opacity-50"
            )}
          >
            <Camera size={14} />
            {displaySrc
              ? language === "ar"
                ? "تغيير الصورة"
                : "Change photo"
              : language === "ar"
                ? "رفع صورة"
                : "Upload photo"}
          </button>

          {pendingFile && !deferUpload ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void savePending()}
              className="inline-flex items-center rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {language === "ar" ? "حفظ الصورة" : "Save photo"}
            </button>
          ) : null}

          {pendingFile ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={clearPending}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-secondary/60 hover:text-secondary disabled:opacity-50"
            >
              {language === "ar" ? "إلغاء المعاينة" : "Discard preview"}
            </button>
          ) : savedAvatar ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void onRemoveSaved()}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {language === "ar" ? "حذف الصورة" : "Remove photo"}
            </button>
          ) : null}
        </div>

        {pendingFile ? (
          <p className="text-xs font-medium text-primary">
            {deferUpload
              ? language === "ar"
                ? "ستُرفع الصورة بعد إنشاء الحساب."
                : "Photo will upload after account creation."
              : language === "ar"
                ? "معاينة جاهزة — احفظ لتطبيق الصورة."
                : "Preview ready — save to apply."}
          </p>
        ) : null}
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
      </div>
    </div>
  );
}
