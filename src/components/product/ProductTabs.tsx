"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/data/mock";

interface ProductTabsProps {
  product: Product;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"description" | "ingredients" | "usage">("description");

  const tabs = [
    { id: "description", label: { ar: "الوصف", en: "Description" } },
    { id: "ingredients", label: { ar: "المكونات", en: "Ingredients" } },
    { id: "usage", label: { ar: "طريقة الاستخدام", en: "How to Use" } },
  ] as const;

  return (
    <div className="mt-24">
      {/* Tabs Navigation */}
      <div className="flex justify-center border-b border-gray-100 mb-12">
        <div className="flex gap-8 md:gap-16 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-xl md:text-2xl font-bold transition-colors whitespace-nowrap relative ${
                activeTab === tab.id ? "text-secondary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label[language]}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-primary"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="max-w-3xl mx-auto min-h-[200px]">
        {/* Description */}
        <div
          className={`transition-opacity duration-500 ${
            activeTab === "description" ? "opacity-100 block" : "opacity-0 hidden"
          }`}
        >
          <p className="text-gray-600 text-lg leading-loose text-center">
            {product.description?.[language] || (language === "ar" ? "لا يوجد وصف إضافي متاح." : "No additional description available.")}
          </p>
        </div>

        {/* Ingredients */}
        <div
          className={`transition-opacity duration-500 ${
            activeTab === "ingredients" ? "opacity-100 block" : "opacity-0 hidden"
          }`}
        >
          {product.ingredients ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.ingredients[language].map((ingredient, index) => (
                <li key={index} className="flex items-center gap-3 text-lg text-gray-600 bg-background p-4 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>
                  {ingredient}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-lg text-center">
              {language === "ar" ? "معلومات المكونات غير متوفرة." : "Ingredients information not available."}
            </p>
          )}
        </div>

        {/* Usage */}
        <div
          className={`transition-opacity duration-500 ${
            activeTab === "usage" ? "opacity-100 block" : "opacity-0 hidden"
          }`}
        >
          <div className="bg-background p-8 rounded-xl border border-primary/10">
            <p className="text-gray-600 text-lg leading-loose">
              {product.usage?.[language] || (language === "ar" ? "تعليمات الاستخدام غير متوفرة." : "Usage instructions not available.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
