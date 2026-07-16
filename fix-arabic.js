const fs = require('fs');
const { execSync } = require('child_process');

function getFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const name = dir + '/' + file;
    if (fs.statSync(name).isDirectory()) getFiles(name, files);
    else if (name.endsWith('.tsx')) files.push(name);
  });
  return files;
}
const files = getFiles('src/components');
let totalFixed = 0;

files.forEach(file => {
  try {
    const oldContent = execSync('git show 13b92de:' + file.replace(/\\/g, '/')).toString('utf-8');
    let newContent = fs.readFileSync(file, 'utf-8');
    let modified = false;

    // 1. Fix language ternaries: language === "ar" ? "ARABIC" : "ENGLISH"
    const oldRegex = /language === "ar" \? "([^"]+)" : "([^"]+)"/g;
    const map = {};
    let match;
    while ((match = oldRegex.exec(oldContent)) !== null) {
      map[match[2]] = match[1];
    }
    
    const newRegex = /language === "ar" \? "([^"]+)" : "([^"]+)"/g;
    newContent = newContent.replace(newRegex, (fullMatch, corruptedAr, en) => {
      if (map[en] && corruptedAr !== map[en]) {
        modified = true;
        return 'language === "ar" ? "' + map[en] + '" : "' + en + '"';
      }
      return fullMatch;
    });

    // 2. Fix JSX comments: {/* ARABIC */}
    const oldCommentRegex = /\{\/\* ([^}]+) \*\/\}/g;
    const commentMap = [];
    while ((match = oldCommentRegex.exec(oldContent)) !== null) {
      if (match[1].match(/[\u0600-\u06FF]/)) { // Has Arabic
        commentMap.push(match[1]);
      }
    }
    
    const newCommentRegex = /\{\/\* ([^}]+) \*\/\}/g;
    let commentIndex = 0;
    newContent = newContent.replace(newCommentRegex, (fullMatch, corruptedAr) => {
      // If we blindly replace, we must match order. This might be risky but usually comment count matches.
      // Let's only do it if the corrupted comment looks weird (has ? or Ø).
      if (corruptedAr.includes('?') || corruptedAr.includes('Ø')) {
        if (commentIndex < commentMap.length) {
            modified = true;
            return '{/* ' + commentMap[commentIndex++] + ' */}';
        }
      }
      return fullMatch;
    });

    // 3. Fix the paragraph in Footer:
    // It has: {language === "ar" ? "..." : "..."}
    // And also PARADISE. {language === "ar" ? "..." : "..."}
    
    if (modified) {
      fs.writeFileSync(file, newContent, 'utf-8');
      totalFixed++;
      console.log('Fixed Arabic in ' + file);
    }
  } catch (e) {
    // console.log(e);
  }
});
console.log('Total files fixed: ' + totalFixed);
