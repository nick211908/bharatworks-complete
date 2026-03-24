const fs = require('fs');

const content = fs.readFileSync('c:\\Users\\Acer\\Desktop\\Bharatworks\\MyApp\\src\\screens\\Labour\\JobApply.tsx', 'utf-8');
const lines = content.split('\n');

let insideJSX = false;
lines.forEach((line, index) => {
    if (line.includes('return (') || line.includes('=> (')) insideJSX = true;
    if (line.includes(');')) insideJSX = false;

    if (insideJSX) {
        // Find naked text outside tags
        // Match lines that have text standing outside tags < >
        const tagLess = line.replace(/<[^>]+>/g, '').trim();
        // If it starts/ends with string and not part of code logic
        if (tagLess && !tagLess.startsWith('//') && !tagLess.includes('{') && !tagLess.includes('}')) {
             if (/[a-zA-Z]/.test(tagLess)) {
                 console.log(`Line ${index + 1}: ${line.trim()} -> Text: ${tagLess}`);
             }
        }
    }
});
