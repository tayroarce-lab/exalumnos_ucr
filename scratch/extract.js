const fs = require('fs');
const html = fs.readFileSync('c:\\\\Users\\\\DELL7\\\\Downloads\\\\exalumnos_ucr\\\\Intro ALUMNI UCR - Energetico.html', 'utf8');
const match = html.match(/<script type="__bundler\/manifest">\s*([\s\S]*?)\s*<\/script>/);
if (match) {
  const manifest = JSON.parse(match[1]);
  for (const key in manifest) {
    const data = manifest[key].data;
    console.log(key, manifest[key].mime, manifest[key].compressed, data ? data.substring(0, 50) : 'null');
    
    // if it's lottie or similar, let's decode and write to disk
    if (manifest[key].mime === 'application/json' || manifest[key].mime === 'image/svg+xml') {
      const decoded = Buffer.from(data, 'base64').toString('utf8');
      fs.writeFileSync(`scratch/${key}.json`, decoded);
      console.log(`Saved scratch/${key}.json`);
    } else if (manifest[key].mime.startsWith('image/') || manifest[key].mime.startsWith('video/')) {
        const decoded = Buffer.from(data, 'base64');
        const ext = manifest[key].mime.split('/')[1];
        fs.writeFileSync(`scratch/${key}.${ext}`, decoded);
        console.log(`Saved scratch/${key}.${ext}`);
    } else if (manifest[key].mime === 'text/html' || manifest[key].mime === 'application/javascript') {
        const decoded = Buffer.from(data, 'base64').toString('utf8');
        fs.writeFileSync(`scratch/${key}.txt`, decoded);
        console.log(`Saved scratch/${key}.txt`);
    }
  }
} else {
  console.log('No manifest found');
}
