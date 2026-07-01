const fs = require('fs');
const path = require('path');

const files = [
  'src/components/forms/StudentOnboardingForm.tsx',
  'src/components/forms/ExalumnoOnboardingForm.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find all className="... focus:ring-celeste/50 ..." or similar in inputs
  // We will just do a simple replacement for the form inputs
  content = content.replace(/className="(w-full p-[0-9.]+ border[^"]*)"/g, (match, p1) => {
    let newClass = p1;
    if (!newClass.includes('text-slate-900')) newClass += ' text-slate-900';
    if (!newClass.includes('bg-white') && !newClass.includes('bg-slate-100')) newClass += ' bg-white';
    return `className="${newClass}"`;
  });

  content = content.replace(/className="(w-full h-11 px-4 border[^"]*)"/g, (match, p1) => {
    let newClass = p1;
    if (!newClass.includes('text-slate-900')) newClass += ' text-slate-900';
    if (!newClass.includes('bg-white') && !newClass.includes('bg-slate-100')) newClass += ' bg-white';
    return `className="${newClass}"`;
  });
  
  content = content.replace(/className="(w-full p-3 border[^"]*)"/g, (match, p1) => {
    let newClass = p1;
    if (!newClass.includes('text-slate-900')) newClass += ' text-slate-900';
    if (!newClass.includes('bg-white') && !newClass.includes('bg-slate-100')) newClass += ' bg-white';
    return `className="${newClass}"`;
  });

  fs.writeFileSync(filePath, content);
  console.log('Fixed', file);
});
