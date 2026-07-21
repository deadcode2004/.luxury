"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { useRealtime, useRealtimeDomains } from "@/contexts/RealtimeContext";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { ApiRequestError } from "@/lib/api/client";
import {
  fetchProductReviews,
  reviewerAvatarUrl,
  submitProductReview,
  type ApiReview,
} from "@/lib/api/reviews";
import { pickLocale, displayPersonName } from "@/lib/i18n/localeText";

type ProductReviewsProps = {
  productId: string;
  onStatsChange?: () => void;
  /** When true, open the add-review modal (e.g. from product rating click). */
  openSignal?: number;
};

export default function ProductReviews({
  productId,
  onStatsChange,
  openSignal = 0,
}: ProductReviewsProps) {
  const { language } = useLanguage();
  const { token, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { signalLocal } = useRealtime();

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(1);

  const load = useCallback(async () => {
    try {
      const list = await fetchProductReviews(productId);
      setReviews(Array.isArray(list) ? list : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useRealtimeDomains(["products"], () => {
    void load();
  });

  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth >= 1024) setCardsToShow(3);
      else if (window.innerWidth >= 768) setCardsToShow(2);
      else setCardsToShow(1);
    };
    updateCardsToShow();
    window.addEventListener("resize", updateCardsToShow);
    return () => window.removeEventListener("resize", updateCardsToShow);
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [reviews.length, cardsToShow, productId]);

  const openAdd = useCallback(() => {
    setRating(5);
    setHoverRating(0);
    setComment("");
    setAuthorName("");
    setError("");
    setModalOpen(true);
  }, []);

  useEffect(() => {
    if (openSignal > 0) openAdd();
  }, [openSignal, openAdd]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = comment.trim();
    if (rating < 1 || rating > 5) {
      setError(language === "ar" ? "اختر عدد النجوم" : "Choose a star rating");
      return;
    }
    if (trimmed.length < 3) {
      setError(
        language === "ar"
          ? "اكتب تعليقاً (٣ أحرف على الأقل)"
          : "Comment must be at least 3 characters"
      );
      return;
    }

    const numericId = Number(productId);
    if (!Number.isFinite(numericId)) {
      setError(language === "ar" ? "منتج غير صالح" : "Invalid product");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const created = await submitProductReview(
        {
          product_id: numericId,
          rating,
          comment: trimmed,
          ...(isAuthenticated
            ? {}
            : authorName.trim()
              ? { author_name: authorName.trim() }
              : {}),
        },
        token
      );
      setReviews((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      setCurrentIndex(0);
      signalLocal(["products", "dashboard"]);
      onStatsChange?.();
      setModalOpen(false);
      toast(language === "ar" ? "✔ تم إرسال تقييمك" : "✔ Review submitted", "success");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : language === "ar"
            ? "تعذر إرسال التقييم"
            : "Failed to submit review"
      );
    } finally {
      setSaving(false);
    }
  };

  const displayStars = hoverRating || rating;
  const loggedInName = displayPersonName(user, language, "");
  const hasUploadedAvatar = Boolean(user?.avatar?.trim());
  const totalDots = Math.max(1, reviews.length - cardsToShow + 1);

  const next = () => {
    setCurrentIndex((prev) => (prev >= totalDots - 1 ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? totalDots - 1 : prev - 1));
  };

  return (
    <section id="product-reviews" className="border-t border-gray-100 pt-16 scroll-mt-28">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-secondary">
            {language === "ar" ? "تقييمات العملاء" : "Customer Reviews"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {language === "ar"
              ? reviews.length
                ? `${reviews.length} تقييم`
                : "لا توجد تقييمات بعد"
              : reviews.length
                ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}`
                : "No reviews yet"}
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={openAdd}>
          {language === "ar" ? "إضافة تقييم" : "Add Review"}
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">
          {language === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-14 px-6 bg-white/60 border border-dashed border-gray-200 rounded-2xl">
          <p className="text-secondary/70 text-base mb-5">
            {language === "ar"
              ? "كن أول من يقيّم هذا المنتج."
              : "Be the first to review this product."}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={openAdd}>
            {language === "ar" ? "إضافة تقييم" : "Add Review"}
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(${
                  language === "ar"
                    ? currentIndex * (100 / cardsToShow)
                    : -(currentIndex * (100 / cardsToShow))
                }%)`,
              }}
            >
              {reviews.map((review) => {
                const author = pickLocale(review.author, language) || "—";
                const text =
                  pickLocale(review.comment, language) ||
                  review.comment?.ar ||
                  review.comment?.en ||
                  "";
                const avatar = review.author_avatar || reviewerAvatarUrl(author);
                return (
                  <div
                    key={review.id}
                    className="px-2 sm:px-3 shrink-0"
                    style={{ width: `${100 / cardsToShow}%` }}
                  >
                    <article className="bg-white border border-surface/60 rounded-2xl p-5 md:p-6 h-full flex flex-col relative group shadow-sm hover:shadow-md transition-shadow duration-300">
                      <Quote
                        size={26}
                        className="text-primary/10 absolute top-5 end-5 group-hover:text-primary/20 transition-colors"
                      />
                      <div className="flex text-accent mb-4 relative z-10">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i <= review.rating ? "currentColor" : "none"}
                            className={i <= review.rating ? "text-accent" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <p className="text-secondary/80 text-sm md:text-base leading-relaxed italic relative z-10 flex-1 min-h-[4.5rem]">
                        &ldquo;{text}&rdquo;
                      </p>
                      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-surface/50">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-secondary shrink-0">
                          <Image
                            src={avatar}
                            alt={author}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-secondary text-sm truncate">{author}</p>
                          {review.created_at ? (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {new Date(review.created_at).toLocaleDateString(
                                language === "ar" ? "ar-EG" : "en-GB"
                              )}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          {totalDots > 1 ? (
            <>
              <button
                type="button"
                onClick={language === "ar" ? next : prev}
                className="absolute top-1/2 -translate-y-1/2 -start-1 sm:-start-3 md:-start-5 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors z-20 border border-gray-100"
                aria-label={language === "ar" ? "السابق" : "Previous"}
              >
                {language === "ar" ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
              </button>
              <button
                type="button"
                onClick={language === "ar" ? prev : next}
                className="absolute top-1/2 -translate-y-1/2 -end-1 sm:-end-3 md:-end-5 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors z-20 border border-gray-100"
                aria-label={language === "ar" ? "التالي" : "Next"}
              >
                {language === "ar" ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
              </button>
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalDots }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === currentIndex ? "bg-primary w-8" : "bg-gray-300 hover:bg-gray-400 w-2.5"
                    }`}
                    aria-label={
                      language === "ar" ? `الشريحة ${i + 1}` : `Go to slide ${i + 1}`
                    }
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => (!saving ? setModalOpen(false) : undefined)}
        title={language === "ar" ? "إضافة تقييم" : "Add Review"}
        size="md"
      >
        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/15 to-accent/25 ring-2 ring-accent/25 shrink-0">
                {hasUploadedAvatar ? (
                  <Image
                    src={user.avatar!}
                    alt={loggedInName || "User"}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-bold text-secondary">
                    {(loggedInName || user.email || "?").trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  {language === "ar" ? "التقييم باسم" : "Reviewing as"}
                </p>
                <p className="font-bold text-secondary truncate">
                  {loggedInName || user.email}
                </p>
              </div>
            </div>
          ) : (
            <FormField
              label={
                language === "ar" ? "الاسم (اختياري)" : "Name (optional)"
              }
            >
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={
                  language === "ar" ? "اسمك كما سيظهر مع التقييم" : "Your display name"
                }
                disabled={saving}
                maxLength={120}
              />
            </FormField>
          )}

          <FormField label={language === "ar" ? "التقييم" : "Rating"}>
            <div
              className="flex gap-1"
              onMouseLeave={() => setHoverRating(0)}
              role="radiogroup"
              aria-label={language === "ar" ? "عدد النجوم" : "Star rating"}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="p-1 text-accent transition-transform hover:scale-110 active:scale-95"
                  onMouseEnter={() => setHoverRating(value)}
                  onClick={() => setRating(value)}
                  aria-checked={rating === value}
                  role="radio"
                >
                  <Star
                    size={28}
                    fill={value <= displayStars ? "currentColor" : "none"}
                    className={value <= displayStars ? "text-accent" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </FormField>

          <FormField label={language === "ar" ? "تعليقك" : "Your comment"} error={error}>
            <Textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                language === "ar"
                  ? "شاركنا رأيك عن المنتج..."
                  : "Share your thoughts about this product..."
              }
              disabled={saving}
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => setModalOpen(false)}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" variant="secondary" size="sm" loading={saving}>
              {language === "ar" ? "إرسال التقييم" : "Submit Review"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
