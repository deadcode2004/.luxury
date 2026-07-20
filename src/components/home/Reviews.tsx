"use client";

import React, { useEffect, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeDomains } from "@/contexts/RealtimeContext";
import { fetchPublicReviews, type ApiReview } from "@/lib/api/reviews";
import { pickLocale } from "@/lib/i18n/localeText";

export default function Reviews() {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(1);
  const [ready, setReady] = useState(false);

  const load = () =>
    fetchPublicReviews()
      .then((list) => setReviews(Array.isArray(list) ? list : []))
      .catch(() => setReviews([]))
      .finally(() => setReady(true));

  useEffect(() => {
    void load();
  }, []);

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
  }, [reviews.length, cardsToShow]);

  if (!ready || reviews.length === 0) {
    return null;
  }

  const totalDots = Math.max(1, reviews.length - cardsToShow + 1);

  const next = () => {
    setCurrentIndex((prev) => (prev >= totalDots - 1 ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? totalDots - 1 : prev - 1));
  };

  return (
    <section className="py-16 relative overflow-hidden border-b border-surface bg-background">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-secondary mb-3">
            {language === "ar" ? "ماذا يقول عملاؤنا" : "What Our Clients Say"}
          </h2>
          <div className="w-16 h-1 bg-surface mx-auto"></div>
        </div>

        <div className="relative">
          <div className="overflow-hidden mx-auto w-full">
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
                const comment =
                  pickLocale(review.comment, language) ||
                  review.comment?.ar ||
                  review.comment?.en ||
                  "";
                return (
                  <div
                    key={review.id}
                    className="px-3 shrink-0"
                    style={{ width: `${100 / cardsToShow}%` }}
                  >
                    <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md border border-surface/50 relative group transition-all duration-500 flex flex-col h-full">
                      <Quote
                        size={28}
                        className="text-primary/10 absolute top-5 right-5 transform -scale-x-100 rtl:scale-x-100 group-hover:text-primary/20 transition-colors"
                      />

                      <div className="flex text-accent mb-5 relative z-10">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < review.rating ? "currentColor" : "none"}
                            className={i < review.rating ? "text-accent" : "text-gray-300"}
                          />
                        ))}
                      </div>

                      <p className="text-secondary/80 mb-6 leading-relaxed italic relative z-10 min-h-[70px] text-xs md:text-sm">
                        &ldquo;{comment}&rdquo;
                      </p>

                      <div className="flex items-center mt-auto">
                        <div className="w-10 h-10 bg-secondary text-background rounded-full flex items-center justify-center font-bold text-sm me-3 shadow-md">
                          {author.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-secondary text-xs md:text-sm">{author}</h4>
                          <span className="text-[9px] text-secondary/50 uppercase tracking-widest mt-0.5 block">
                            {language === "ar" ? "عميل موثق" : "Verified Buyer"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {totalDots > 1 && (
            <>
              <button
                onClick={language === "ar" ? next : prev}
                className="absolute top-1/2 -translate-y-1/2 -start-2 md:-start-6 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors z-20 border border-gray-100"
                aria-label="Previous Slide"
              >
                {language === "ar" ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
              </button>

              <button
                onClick={language === "ar" ? prev : next}
                className="absolute top-1/2 -translate-y-1/2 -end-2 md:-end-6 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors z-20 border border-gray-100"
                aria-label="Next Slide"
              >
                {language === "ar" ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
              </button>

              <div className="flex justify-center mt-8 gap-2">
                {[...Array(totalDots)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i === currentIndex ? "bg-primary w-8" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
