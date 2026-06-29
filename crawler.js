const fetch = require('node-fetch');
const fs = require('fs');

const BASE = 'https://sharviitechnologies.com/wp-json/wp/v2';

async function crawl() {
  let content = [];
  const types = ['pages', 'posts', 'services', 'portfolio', 'team'];

  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    try {
      const url = BASE + '/' + type + '?per_page=100&_fields=title,content,link,excerpt';
      const res = await fetch(url);
      const text = await res.text();
      if (!text.startsWith('[')) continue;
      const items = JSON.parse(text);
      if (!Array.isArray(items)) continue;
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        const body = (item.content ? item.content.rendered : '') + ' ' + (item.excerpt ? item.excerpt.rendered : '');
        const clean = body.replace(/<style[^>]*>.*?<\/style>/gs, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (clean.length > 50) {
          content.push({ title: item.title.rendered, url: item.link, body: clean });
        }
      }
      console.log('Got ' + items.length + ' ' + type);
    } catch(e) {
      console.log('Skipping ' + type);
    }
  }

  fs.writeFileSync('content.json', JSON.stringify(content, null, 2));
  console.log('Done! Saved ' + content.length + ' total items');
}

crawl();
