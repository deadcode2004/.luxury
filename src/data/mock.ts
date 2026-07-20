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
  stock?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isOffer?: boolean;
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
  { id: "c1", name: { ar: "بخاخ ذهبي فضي", en: "Gold Silver Spray" }, image: "/images/products/paradisecare-home02.jpg" },
  { id: "c2", name: { ar: "كريمة الزعفران الذهبية", en: "Golden Saffron Cream" }, image: "/images/products/paradisecare-home03.jpg" },
  { id: "c3", name: { ar: "حمض الهالورونيك مع الذهب و الفضة", en: "Hyaluronic Acid with Gold & Silver" }, image: "/images/products/paradisecare-shop-hyaluronic-with-gold-and-silver-01-300x300.jpg" },
  { id: "c4", name: { ar: "المغناطيس الحيوي", en: "Biomagnet" }, image: "/images/products/paradisecare-shop-biomagneti-01-300x300.jpeg" },
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
    stock: 45,
    isNew: true,
    isFeatured: true,
    isBestSeller: true,
    isOffer: true,
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
    stock: 12,
    isBestSeller: true, isFeatured: true, isOffer: true, category: "c2",
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
  },
  {
    id: "p3",
    name: { ar: "حمض الهالورونيك مع الذهب و الفضة", en: "Hyaluronic Acid with Gold & Silver" },
    brand: { ar: "أورا رويال", en: "Aura Royale" },
    price: 450,
    image: "/images/products/paradisecare-shop-hyaluronic-with-gold-and-silver-01-300x300.jpg",
    rating: 4.7,
    reviews: 210,
    stock: 0,
    isFeatured: true,
    category: "c2",
    description: {
      ar: "كريم ترطيب مكثف بقوام مخملي يذوب في البشرة فوراً. يغذي البشرة بعمق ويعيد حاجز الرطوبة الطبيعي لحماية تدوم 48 ساعة.",
      en: "An intensive moisturizing cream with a velvet texture that melts into the skin instantly. It deeply nourishes and restores the natural moisture barrier for 48-hour protection."
    },
    ingredients: {
      ar: ["زبدة الشيا العضوية", "زيت الجوجوبا", "سيراميد", "فيتامين هـ"],
      en: ["Organic Shea Butter", "Jojoba Oil", "Ceramides", "Vitamin E"]
    },
    usage: {
      ar: "استخدميه كخطوة أخيرة في روتين العناية بالبشرة. خذي كمية بحجم حبة اللؤلؤ ووزعيها بالتساوي على الوجه والرقبة.",
      en: "Use as the last step in your skincare routine. Take a pearl-sized amount and distribute evenly over the face and neck."
    }
  },
  {
    id: "p4",
    name: { ar: "المغناطيس الحيوي", en: "Biomagnet" },
    brand: { ar: "جلو آند كو", en: "Glow & Co" },
    price: 320,
    image: "/images/products/paradisecare-shop-biomagneti-01-300x300.jpeg",
    rating: 4.9,
    reviews: 340,
    stock: 80,
    isFeatured: true, category: "c3",
    description: {
      ar: "مجموعة مذهلة من 12 لون مستوحاة من ألوان الصحراء وقت الغروب. تركيبة غنية بالصبغات وسهلة الدمج تتيح لك ابتكار إطلالات طبيعية أو درامية جذابة.",
      en: "A stunning collection of 12 shades inspired by desert sunset colors. Highly pigmented and easily blendable formula that allows you to create natural or dramatic looks."
    },
    ingredients: {
      ar: ["ميكا نقية", "زيت بذور العنب", "بدون بارابين", "بدون عطور صناعية"],
      en: ["Pure Mica", "Grape Seed Oil", "Paraben-free", "No Synthetic Fragrances"]
    },
    usage: {
      ar: "استخدمي فرشاة دمج ناعمة للألوان الانتقالية، وفرشاة مسطحة للألوان اللامعة على الجفن المتحرك. يمكن استخدام الألوان اللامعة بإصبعك للحصول على تأثير أقوى.",
      en: "Use a fluffy blending brush for transition shades, and a flat brush for shimmer shades on the lid. Shimmers can be applied with your finger for a more intense effect."
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
