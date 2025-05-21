const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://leather-cms.s3.amazonaws.com/posts.json';
const dest = path.join(__dirname, '../apps/web/app/data/posts.json');

https.get(url, res => {
  if (res.statusCode !== 200) {
    console.error(`Failed to fetch: ${res.statusCode}`);
    process.exit(1);
  }
  const file = fs.createWriteStream(dest);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded posts.json');
  });
});
