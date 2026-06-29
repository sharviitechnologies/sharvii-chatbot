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

// Fallback data loading system
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

app.post('/update-knowledge', (req, res) => {
  try {
    if (req.body && Array.isArray(req.body)) {
      fs.writeFileSync('content.json', JSON.stringify(req.body, null, 2));
      content = req.body;
      fuse = new Fuse(content, { keys: ['title', 'body'], threshold: 0.6 });
      return res.json({ success: true, message: "Bot knowledge updated instantly!" });
    }
    res.status(400).json({ error: "Invalid content format. Expected array." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const results = fuse.search(message).slice(0, 3);
    const context = results.map(r => `Page: ${r.item.title}\nURL: ${r.item.url}\n${r.item.body}`).join('\n\n---\n\n');

    const prompt = `You are a helpful AI assistant for Sharvii Technologies, an NGO digital agency.
Answer the user's question using the site content below. Be conversational and professional.

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
        model: 'claude-3-5-sonnet-latest', 
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data && data.content && data.content[0] && data.content[0].text) {
      res.json({ reply: data.content[0].text });
    } else {
      // Clean fallback reply without markdown formatting bugs
      res.json({ reply: "At Sharvii Technologies, we provide Web Design & Development, Digital Marketing (SEO & Social Media), Branding, Content Creation, Custom Software/CRM Solutions, and Fundraising support for NGOs. Please reach out to us at info@sharviitechnologies.com or visit https://sharviitechnologies.com/contact/ for details!" });
    }

  } catch(e) {
    res.json({ reply: 'Connection reset. Please ask your question again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
