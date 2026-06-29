require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public'))); 

let content = [];
try {
  content = JSON.parse(fs.readFileSync('content.json', 'utf8'));
} catch (e) {
  content = [{ title: "Sharvii Technologies", url: "https://sharviitechnologies.com", body: "NGO Digital Agency" }];
}

let fuse = new Fuse(content, { keys: ['title', 'body'], threshold: 0.6 });

app.get('/', (req, res) => {
  res.send('Sharvii Chatbot is running dynamically!');
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const results = fuse.search(message).slice(0, 3);
    const context = results.map(r => `Page: ${r.item.title}\nURL: ${r.item.url}\n${r.item.body}`).join('\n\n---\n\n');

    const prompt = `You are a helpful AI assistant for Sharvii Technologies, an NGO digital agency.
Answer the user's question using the site content below. Be conversational, direct, and professional.

OUR CORE SERVICES:
- Web Design & Development (Custom design, mobile-responsive, user-friendly UI)
- Digital Marketing (Social media strategy, SEO, online outreach campaigns)
- Branding & Graphic Design (Logos, brand identity, creative visual storytelling)
- Content Creation (Copywriting, blog posts, newsletters, NGO impact reports)
- Technology Solutions (Custom software & app development, CRM & donor management systems, tech support)
- Fundraising & Outreach Support (Digital fundraising, crowdfunding support, donor engagement strategies)

CONTACT DETAILS:
Email: info@sharviitechnologies.com
Contact URL: https://sharviitechnologies.com/contact/

SITE CONTENT CONTEXT:
${context}

USER QUESTION: ${message}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Using ultra-compatible Haiku to prevent key mismatch blocks
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    // Log the API response to the Railway console so we can debug easily!
    console.log("Anthropic API Response:", JSON.stringify(data));

    if (data && data.content && data.content[0] && data.content[0].text) {
      res.json({ reply: data.content[0].text });
    } else if (data && data.error) {
      // If Anthropic tells us something is wrong (like insufficient funds), show it directly
      res.json({ reply: `API Notice: ${data.error.message}. Please check your console settings.` });
    } else {
      res.json({ reply: "I am having trouble reading our internal service docs right now. Let's talk directly! Reach out to us at info@sharviitechnologies.com or check out https://sharviitechnologies.com/contact/" });
    }

  } catch(e) {
    console.error("Chat Server Error:", e);
    res.json({ reply: 'Connection reset. Please ask your question again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
