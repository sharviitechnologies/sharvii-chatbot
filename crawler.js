const fetch = require('node-fetch');
const fs = require('fs');

const BASE = 'https://sharviitechnologies.com/wp-json/wp/v2';

async function crawl() {
  let content = [];
  const types = ['pages', 'posts'];
  
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    try {
      const url = BASE + '/' + type + '?per_page=100';
      console.log('Fetching: ' + url);
      const res = await fetch(url);
      const text = await res.text();
      console.log('Response starts with: ' + text.substring(0, 50));
      const items = JSON.parse(text);
      if (!Array.isArray(items)) continue;
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        const body = item.content.rendered.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        content.push({ title: item.title.rendered, url: item.link, body: body });
      }
      console.log('Got ' + items.length + ' ' + type);
    } catch(e) {
      console.log('Error: ' + e.message);
    }
  }

  fs.writeFileSync('content.json', JSON.stringify(content, null, 2));
  console.log('Done! Saved ' + content.length + ' pages');
}

crawl();