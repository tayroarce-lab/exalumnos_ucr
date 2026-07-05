const fs = require('fs');
const files = [
  'src/app/page.tsx',
  'src/components/ui/AuthBackground.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // AuthBackground.tsx specific:
    content = content.replace(/stroke=\{\`rgba\(\$\{c\},0\.25\)\`\}/g, 'stroke="rgba(0,0,0,0.06)"');
    content = content.replace(/stroke=\{\`rgba\(\$\{c\},0\.15\)\`\}/g, 'stroke="rgba(0,0,0,0.04)"');
    content = content.replace(/stroke=\{\`rgba\(\$\{c\},0\.85\)\`\}/g, 'stroke="rgba(0,0,0,0.15)"');
    content = content.replace(/stroke=\{\`rgba\(\$\{c\},0\.65\)\`\}/g, 'stroke="rgba(0,0,0,0.12)"');
    content = content.replace(/stroke=\{\`rgba\(\$\{c\},0\.55\)\`\}/g, 'stroke="rgba(0,0,0,0.10)"');
    
    // page.tsx specific:
    content = content.replace(/rgba\(255,255,255,0\.09\)/g, 'rgba(0,0,0,0.04)');
    content = content.replace(/rgba\(255,255,255,0\.05\)/g, 'rgba(0,0,0,0.02)');
    content = content.replace(/rgba\(255,255,255,0\.80\)/g, 'rgba(0,0,0,0.15)');
    content = content.replace(/rgba\(255,255,255,1\.0\)/g, 'rgba(0,0,0,0.2)');
    content = content.replace(/rgba\(255,255,255,0\.8\)/g, 'rgba(0,0,0,0.15)');
    content = content.replace(/rgba\(255,255,255,0\.62\)/g, 'rgba(0,0,0,0.12)');
    content = content.replace(/rgba\(255,255,255,0\.55\)/g, 'rgba(0,0,0,0.10)');
    content = content.replace(/rgba\(255,255,255,0\.45\)/g, 'rgba(0,0,0,0.08)');
    content = content.replace(/rgba\(255,255,255,0\.68\)/g, 'rgba(0,0,0,0.12)');
    content = content.replace(/rgba\(255,255,255,0\.30\)/g, 'rgba(0,0,0,0.06)');
    
    // colored svgs in page.tsx:
    content = content.replace(/rgba\(255,165,0,1\.0\)/g, 'rgba(0,0,0,0.15)');
    content = content.replace(/rgba\(255,80,40,1\.0\)/g, 'rgba(0,0,0,0.15)');
    content = content.replace(/rgba\(255,155,24,0\.45\)/g, 'rgba(0,0,0,0.05)');
    content = content.replace(/rgba\(255,155,24,0\.88\)/g, 'rgba(0,0,0,0.15)');
    content = content.replace(/rgba\(255,155,24,0\.72\)/g, 'rgba(0,0,0,0.08)');
    content = content.replace(/rgba\(255,155,24,0\.95\)/g, 'rgba(0,0,0,0.18)');
    
    content = content.replace(/rgba\(243,75,38,0\.58\)/g, 'rgba(0,0,0,0.12)');
    content = content.replace(/rgba\(243,75,38,0\.08\)/g, 'rgba(0,0,0,0.02)');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed SVGs in', file);
  }
});
