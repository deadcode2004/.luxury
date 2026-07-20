import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import ProductGrid from "@/components/home/ProductGrid";
import Offers from "@/components/home/Offers";
import Features from "@/components/home/Features";
import Reviews from "@/components/home/Reviews";
import InstagramGallery from "@/components/home/InstagramGallery";
import { products } from "@/data/mock";

export default function Home() {
  const featuredProducts = products.filter((p) => p.isFeatured);
  const bestSellers = products.filter((p) => p.isBestSeller);

  return (
    <main className="flex-grow">
      <Hero />
      <Features />
      <Categories />
      <ProductGrid
        title={{ ar: "المنتجات المميزة", en: "Featured Products" }}
        subtitle={{ ar: "اختياراتنا لك", en: "Our Picks For You" }}
        products={featuredProducts}
      />
      <Offers />
      <ProductGrid
        title={{ ar: "الأكثر مبيعاً", en: "Best Sellers" }}
        subtitle={{ ar: "الأكثر طلباً", en: "Most Loved" }}
        products={bestSellers}
      />
      <Reviews />
      <InstagramGallery />
    </main>
  );
}
