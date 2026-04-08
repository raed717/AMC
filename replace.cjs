const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('apps/web/src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Replace teal with emerald
  content = content.replace(/teal-/g, 'emerald-');
  
  // Replace indigo with teal
  content = content.replace(/indigo-/g, 'teal-');

  // Fix JSPDF colors
  content = content.replace(/20, 184, 166/g, '16, 185, 129'); // emerald-500 RGB
  content = content.replace(/Teal-500/g, 'Emerald-500');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Updated', file);
  }
});

console.log('Total files changed:', changedFiles);
