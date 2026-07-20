"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { uploadOwnerFile, ApiRequestError } from "@/lib/api/owner";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

type ImageUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  folder?: "products" | "cms" | "categories";
  error?: string;
  className?: string;
};

export default function ImageUploadField({
  value,
  onChange,
  folder = "products",
  error,
  className,
}: ImageUploadFieldProps) {
  const { language } = useLanguage();
  const { token } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onPick = async (file: File | null) => {
    if (!file || !token) return;
    setUploading(true);
    try {
      const data = await uploadOwnerFile(token, file, folder);
      onChange(data.url);
      toast(language === "ar" ? "✔ تم رفع الصورة" : "✔ Image uploaded", "success");
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : language === "ar"
            ? "فشل رفع الصورة"
            : "Upload failed";
      toast(msg, "danger");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
      />

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 h-44">
          <Image src={value} alt="" fill className="object-cover" sizes="400px" unoptimized />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-white text-sm font-bold text-secondary"
            >
              {language === "ar" ? "تغيير" : "Change"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 rounded-xl bg-white text-red-500"
              aria-label="Remove"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading || !token}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
            error
              ? "border-red-300 text-red-400"
              : "border-gray-200 text-gray-400 hover:border-primary hover:text-primary"
          )}
        >
          {uploading ? <Loader2 size={28} className="animate-spin" /> : <ImageIcon size={28} />}
          <span className="text-sm font-medium">
            {uploading
              ? language === "ar"
                ? "جاري الرفع..."
                : "Uploading..."
              : language === "ar"
                ? "اضغط لرفع صورة المنتج"
                : "Click to upload product image"}
          </span>
        </button>
      )}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
