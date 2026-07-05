const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F000}-\u{1FFFF}]|[\u{FE00}-\u{FEFF}]|[\u{2B50}]|[\u{203C}-\u{3299}]/gu;

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src');
let changedCount = 0;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (emojiRegex.test(content)) {
        const newContent = content.replace(emojiRegex, '');
        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log('Cleaned:', file);
            changedCount++;
        }
    }
});
console.log('Total files cleaned:', changedCount);
