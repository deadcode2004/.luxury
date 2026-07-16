const fs = require('fs');

const file = 'src/components/home/Categories.tsx';
const newContent = fs.readFileSync(file, 'utf-8');

const newRegex = /language === "ar" \? "([^"]+)" : "([^"]+)"/g;
let match;
while ((match = newRegex.exec(newContent)) !== null) {
  console.log('Found in new:', match[1], ' | ', match[2]);
}
