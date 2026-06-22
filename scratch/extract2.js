const fs = require('fs');
const html = fs.readFileSync('c:\\\\Users\\\\DELL7\\\\Downloads\\\\exalumnos_ucr\\\\Intro ALUMNI UCR - Energetico.html', 'utf8');
const match = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
if (match) {
  fs.writeFileSync('scratch/template.html', match[1]);
  console.log('Saved template');
} else {
  console.log('no template');
}
