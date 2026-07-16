const fs = require('fs');

const file = 'src/components/common/Footer.tsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(/bg-secondary text-white/g, 'bg-background text-secondary');
content = content.replace(/text-gray-400/g, 'text-secondary/70');
content = content.replace(/text-gray-500/g, 'text-secondary/70');
content = content.replace(/bg-white\/5 border border-white\/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all/g, 'bg-primary text-background flex items-center justify-center hover:bg-primary-hover transition-all');
content = content.replace(/border-t border-white\/10/g, ''); // User asked to remove footer top border before! "كسم الفوتر شيل خلفيته ... التوب بتاع اللفوتر فيه لسه خلفيه غامقه"
content = content.replace(/hover:text-white/g, 'hover:text-primary');

// Newsletter input
content = content.replace(/bg-white\/5 border border-white\/10/g, 'bg-surface/50 border border-surface');
content = content.replace(/text-white placeholder-gray-500/g, 'text-secondary placeholder-secondary/50');

// Newsletter button
content = content.replace(/bg-primary hover:bg-primary\/90 text-secondary/g, 'bg-primary hover:bg-primary-hover text-background');

fs.writeFileSync(file, content, 'utf-8');
