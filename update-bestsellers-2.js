const fs = require('fs');

let content = fs.readFileSync('src/data/mock.ts', 'utf-8');

// Remove isBestSeller from p6 (Distilled Argan Hair Oil)
content = content.replace(
  /reviews: 415,\n    isBestSeller: true,\n    category: "c4",/g,
  'reviews: 415,\n    category: "c4",'
);

// Add isBestSeller to p1 (Gold Silver Spray)
content = content.replace(
  /isFeatured: true,\n    category: "c1",/g,
  'isFeatured: true,\n    isBestSeller: true,\n    category: "c1",'
);

fs.writeFileSync('src/data/mock.ts', content, 'utf-8');
