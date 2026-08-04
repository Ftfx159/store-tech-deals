const fs = require('fs');
const path = require('path');

const dirs = ['./src', './package.json', './package-lock.json'];
const replacements = [
  { match: /FTFX Tech Deals/g, replace: 'Orvessa' },
  { match: /<span className="text-gradient">FTFX<\/span> Tech Deals/g, replace: '<span className="text-gradient">Orvessa</span>' },
  { match: /ftfxtechdeals\.com/g, replace: 'orvessa.com' },
  { match: /ftfx-tech-deals/g, replace: 'orvessa' },
  { match: /'ftfx_/g, replace: "'orvessa_" },
  { match: /FTFX-PC-Quotation/g, replace: "Orvessa-PC-Quotation" },
  { match: /"FTFX"/g, replace: '"Orvessa"' },
  { match: />FTFX</g, replace: '>Orvessa<' },
  { match: /alerts@ftfxtechdeals\.com/g, replace: 'alerts@orvessa.com' }
];

function processPath(targetPath) {
  if (fs.statSync(targetPath).isDirectory()) {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      processPath(path.join(targetPath, file));
    }
  } else if (/\.(js|jsx|css|json)$/.test(targetPath)) {
    let content = fs.readFileSync(targetPath, 'utf8');
    let changed = false;
    for (const {match, replace} of replacements) {
      if (content.match(match)) {
        content = content.replace(match, replace);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(targetPath, content);
      console.log(`Updated ${targetPath}`);
    }
  }
}

for (const p of dirs) {
  processPath(p);
}
console.log("Done renaming.");
