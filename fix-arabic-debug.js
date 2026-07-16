const fs = require('fs');
const { execSync } = require('child_process');

const file = 'src/components/home/Categories.tsx';
const oldContent = execSync('git show 13b92de:' + file).toString('utf-8');
const newContent = fs.readFileSync(file, 'utf-8');

const oldRegex = /language === "ar" \? "([^"]+)" : "([^"]+)"/g;
const map = {};
let match;
while ((match = oldRegex.exec(oldContent)) !== null) {
  map[match[2]] = match[1];
}
console.log('Map: ', map);

let newContent2 = newContent.replace(oldRegex, (fullMatch, corruptedAr, en) => {
  if (map[en] && corruptedAr !== map[en]) {
    return 'language === "ar" ? "' + map[en] + '" : "' + en + '"';
  }
  return fullMatch;
});
if (newContent !== newContent2) {
  console.log('Categories.tsx modified!');
  fs.writeFileSync(file, newContent2, 'utf-8');
}
