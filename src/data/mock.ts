export interface Product {
  id: string;
  name: { ar: string; en: string };
  brand: { ar: string; en: string };
  price: number;
  oldPrice?: number;
  image: string;
  gallery?: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  category: string;
  description?: { ar: string; en: string };
  ingredients?: { ar: string[]; en: string[] };
  usage?: { ar: string; en: string };
}

export interface Category {
  id: string;
  name: { ar: string; en: string };
  image: string;
}

export const categories: Category[] = [
  { id: "c1", name: { ar: "عطور", en: "Perfumes" }, image: "https://picsum.photos/seed/c1/800/800" },
  { id: "c2", name: { ar: "عناية بالبشرة", en: "Skincare" }, image: "https://picsum.photos/seed/c2/800/800" },
  { id: "c3", name: { ar: "مكياج", en: "Makeup" }, image: "https://picsum.photos/seed/c3/800/800" },
  { id: "c4", name: { ar: "عناية بالشعر", en: "Haircare" }, image: "https://picsum.photos/seed/c4/800/800" },
];

export const products: Product[] = [
  {
    id: "p1",
    name: { ar: "بخاخ ذهبي فضي", en: "Gold Silver Spray" },
    brand: { ar: "بارادايس إيسنس", en: "Paradise Essence" },
    price: 1250,
    image: "/images/products/paradisecare-home02.jpg",
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isFeatured: true,
    isBestSeller: true,
    category: "c1",
    description: {
      ar: "عطر شرقي فاخر يجمع بين الأصالة والعصرية. مزيج ساحر من العود والزعفران مع نفحات رقيقة من الورد الدمشقي، مصمم خصيصاً لأصحاب الذوق الرفيع ليترك بصمة لا تُنسى في كل مكان.",
      en: "A luxurious oriental perfume that combines authenticity and modernity. An enchanting blend of oud and saffron with delicate notes of Damask rose, designed specially for those with refined taste to leave an unforgettable impression everywhere."
    },
    ingredients: {
      ar: ["عود كمبودي معتق", "زعفران إسباني نقي", "ورد دمشقي", "مسك أبيض", "خشب الصندل"],
      en: ["Aged Cambodian Oud", "Pure Spanish Saffron", "Damask Rose", "White Musk", "Sandalwood"]
    },
    usage: {
      ar: "رش العطر على نقاط النبض (الرسغين، الرقبة، وخلف الأذنين) من مسافة 15-20 سم. تجنب فرك العطر لضمان بقاء تركيبة الروائح متوازنة.",
      en: "Spray the perfume on pulse points (wrists, neck, and behind the ears) from a distance of 15-20 cm. Avoid rubbing to ensure the scent notes remain balanced."
    }
  },
  {
    id: "p2",
    name: { ar: "كريمة الزعفران الذهبية", en: "Golden Saffron Cream" },
    brand: { ar: "أورا رويال", en: "Aura Royale" },
    price: 850,
    oldPrice: 1000,
    image: "/images/products/paradisecare-home03.jpg",
    rating: 4.8,
    reviews: 95,
    isBestSeller: true, isFeatured: true, category: "c2",
    description: {
      ar: "سيروم مغذي غني برقائق الذهب عيار 24 قيراط وحمض الهيالورونيك. يعمل على تجديد خلايا البشرة، تقليل الخطوط الدقيقة، وإعطاء إشراقة شبابية فورية.",
      en: "A nourishing serum enriched with 24K gold flakes and Hyaluronic Acid. It works to renew skin cells, reduce fine lines, and provide an instant youthful glow."
    },
    ingredients: {
      ar: ["رقائق ذهب عيار 24 قيراط", "حمض الهيالورونيك", "فيتامين سي", "مستخلص الصبار", "كولاجين بحري"],
      en: ["24K Gold Flakes", "Hyaluronic Acid", "Vitamin C", "Aloe Vera Extract", "Marine Collagen"]
    },
    usage: {
      ar: "ضعي 3-4 قطرات على بشرة نظيفة وجافة صباحاً ومساءً. دلكي بلطف بحركات دائرية لأعلى حتى يمتص تماماً قبل وضع المرطب.",
      en: "Apply 3-4 drops onto clean, dry skin morning and evening. Gently massage in upward circular motions until fully absorbed before applying moisturizer."
    }
  }
];

export const reviews = [
  {
    id: "r1",
    author: { ar: "سارة محمد", en: "Sarah M." },
    rating: 5,
    comment: { ar: "منتجات رائعة جداً وتغليف فاخر يليق بالمستوى. سرعة في التوصيل وتجربة ممتازة عموماً.", en: "Amazing products and luxury packaging. Fast delivery and overall excellent experience." }
  },
  {
    id: "r2",
    author: { ar: "نورة العبدالله", en: "Noura A." },
    rating: 5,
    comment: { ar: "السيروم غير بشرتي بالكامل! أنصح به بشدة لكل من تبحث عن النضارة الحقيقية.", en: "The serum completely transformed my skin! Highly recommend it to anyone looking for real glow." }
  },
  {
    id: "r3",
    author: { ar: "ريم الخالد", en: "Reem K." },
    rating: 4,
    comment: { ar: "العطور ثباتها عالي وريحتها مميزة جداً، لا تشبه أي عطر آخر في السوق.", en: "Perfumes have high longevity and very unique scents, unlike anything else in the market." }
  }
];
