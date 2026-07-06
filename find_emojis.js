const fs = require('fs');
const glob = require('glob');

const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u2300-\u23FF]|[\u2B50]|[\u203C-\u3299]/;

glob('src/**/*.{ts,tsx}', (err, files) => {
  files.forEach(file => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (emojiRegex.test(line)) {
        // if not a comment
        if (!line.trim().startsWith('//') && !line.trim().startsWith('/*') && !line.trim().startsWith('*')) {
          console.log(file + ':' + (i+1) + ':' + line.trim());
        }
      }
    });
  });
});
