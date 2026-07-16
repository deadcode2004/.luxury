const fs = require('fs');

let content = fs.readFileSync('src/data/mock.ts', 'utf-8');

// Replace p1
content = content.replace(
  /name: \{ ar: "عطر ليالي الشرق", en: "Oriental Nights Perfume" \}/g,
  'name: { ar: "بخاخ ذهبي فضي", en: "Gold Silver Spray" }'
);
content = content.replace(
  /image: "https:\/\/picsum.photos\/seed\/p1\/800\/800"/g,
  'image: "/images/products/paradisecare-shop-gold-silver-spray-01-300x300.jpg"'
);

// Replace p2
content = content.replace(
  /name: \{ ar: "سيروم الذهب عيار 24", en: "24K Gold Serum" \}/g,
  'name: { ar: "كريمة الزعفران الذهبية", en: "Golden Saffron Cream" }'
);
content = content.replace(
  /image: "https:\/\/picsum.photos\/seed\/p2\/800\/800"/g,
  'image: "/images/products/paradisecare-shop-gold-saffron-cream-01-300x300.jpg"'
);
content = content.replace( // Ensure p2 is featured
  /isBestSeller: true,\s*category: "c2"/,
  'isBestSeller: true, isFeatured: true, category: "c2"'
);

// Replace p3
content = content.replace(
  /name: \{ ar: "كريم الترطيب المخملي", en: "Velvet Moisture Cream" \}/g,
  'name: { ar: "حمض الهالورونيك مع الذهب و الفضة", en: "Hyaluronic Acid with Gold & Silver" }'
);
content = content.replace(
  /image: "https:\/\/picsum.photos\/seed\/p3\/800\/800"/g,
  'image: "/images/products/paradisecare-shop-hyaluronic-with-gold-and-silver-01-300x300.jpg"'
);

// Replace p4
content = content.replace(
  /name: \{ ar: "باليت ظلال العيون الصحراوي", en: "Desert Oasis Palette" \}/g,
  'name: { ar: "المغناطيس الحيوي", en: "Biomagnet" }'
);
content = content.replace(
  /image: "https:\/\/picsum.photos\/seed\/p4\/800\/800"/g,
  'image: "/images/products/paradisecare-shop-biomagneti-01-300x300.jpeg"'
);
content = content.replace( // Ensure p4 is featured
  /isBestSeller: true,\s*category: "c3"/,
  'isFeatured: true, category: "c3"'
);

// Remove isFeatured from p6 to keep exactly 4 featured products
content = content.replace(
  /isFeatured: true,\s*isBestSeller: true,\s*category: "c4"/,
  'isBestSeller: true, category: "c4"'
);

fs.writeFileSync('src/data/mock.ts', content, 'utf-8');
