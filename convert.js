const fs = require('fs');
try {
  const file = fs.readFileSync('./src/data/mockData.js', 'utf-8');
  const match = file.match(/export const products = (\[[\s\S]*\]);/);
  if (match) {
    const arr = eval(match[1]);
    fs.writeFileSync('./src/data/mockData.json', JSON.stringify(arr, null, 2));
    console.log('Success');
  } else {
    console.error('No match found');
  }
} catch (e) {
  console.error(e);
}
