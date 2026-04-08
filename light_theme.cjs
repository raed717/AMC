const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-\[#020617\]/g, replace: 'bg-background' },
  { regex: /text-slate-50\b/g, replace: 'text-foreground' },
  { regex: /text-white\b/g, replace: 'text-foreground' },
  { regex: /bg-slate-950\b/g, replace: 'bg-background' },
  { regex: /bg-slate-950\/80/g, replace: 'bg-background/80' },
  { regex: /bg-slate-950\/90/g, replace: 'bg-background/90' },
  { regex: /bg-slate-900\/90/g, replace: 'bg-card/90' },
  { regex: /bg-slate-900\/50/g, replace: 'bg-card' },
  { regex: /bg-slate-900\/40/g, replace: 'bg-card' },
  { regex: /bg-slate-900\/30/g, replace: 'bg-card' },
  { regex: /bg-slate-900\b/g, replace: 'bg-card' },
  { regex: /bg-slate-800\/50/g, replace: 'bg-muted' },
  { regex: /hover:bg-slate-800\/50/g, replace: 'hover:bg-accent' },
  { regex: /bg-slate-800\b/g, replace: 'bg-muted' },
  { regex: /hover:bg-slate-800\b/g, replace: 'hover:bg-accent' },
  { regex: /bg-slate-700\b/g, replace: 'bg-muted-foreground/20' },
  { regex: /border-slate-900\b/g, replace: 'border-border' },
  { regex: /border-slate-800\/80/g, replace: 'border-border' },
  { regex: /border-slate-800\b/g, replace: 'border-border' },
  { regex: /border-slate-700\/50/g, replace: 'border-border' },
  { regex: /border-slate-700\b/g, replace: 'border-border' },
  { regex: /border-slate-600\b/g, replace: 'border-border' },
  { regex: /border-slate-500\b/g, replace: 'border-border' },
  { regex: /text-slate-100\b/g, replace: 'text-card-foreground' },
  { regex: /text-slate-200\b/g, replace: 'text-card-foreground' },
  { regex: /text-slate-300\b/g, replace: 'text-foreground' },
  { regex: /text-slate-400\b/g, replace: 'text-muted-foreground' },
  { regex: /text-slate-500\b/g, replace: 'text-muted-foreground' },
  { regex: /text-slate-600\b/g, replace: 'text-muted-foreground' },
  { regex: /hover:text-slate-100\b/g, replace: 'hover:text-accent-foreground' },
  { regex: /hover:text-slate-200\b/g, replace: 'hover:text-accent-foreground' },
  { regex: /text-slate-950\b/g, replace: 'text-primary-foreground' },
];

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
  
  replacements.forEach(({ regex, replace }) => {
    content = content.replace(regex, replace);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Updated', file);
  }
});

console.log('Total files changed:', changedFiles);
