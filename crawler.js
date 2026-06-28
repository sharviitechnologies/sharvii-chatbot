const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const SITE = 'https://sharviitechnologies.com';

const PAGES = [
  '/',
  '/about/',
  '/our-services/',
  '/our-impact/',
  '/contact-us/',
  '/consultation/',
  '/sharvii-donation-platform/',
  '/task-management/',
  '/impact-tech-2026/'
];

async function scrapePage(path) {
  try {
    const res = await axios.get(SITE + path, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    });
    const $ = cheerio.load(res.data);
    $('script, style, nav, footer, head').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    const title = $('title').text() || path;
    console.log('Scraped: ' + path + ' (' + text.length + ' chars)');
    return { title, url: SITE + path, body: text };
  } catch(e) {
    console.log('Failed: ' + path + ' - ' + e.message);
    return null;
  }
}

async function crawl() {
  const content = [];
  content.push({
    title: 'Contact Information',
    url: SITE + '/contact-us/',
    body: 'Contact Sharvii Technologies. Email: support@sharvii.com Phone: +91 97390 06477. Book a call at https://sharviitechnologies.com/consultation/'
  });
  for (const path of PAGES) {
    const page = await scrapePage(path);
    if (page && page.body.length > 100) content.push(page);
    await new Promise(r => setTimeout(r, 1000));
  }
  fs.writeFileSync('content.json', JSON.stringify(content, null, 2));
  console.log('Done! Saved ' + content.length + ' pages');
}

crawl();