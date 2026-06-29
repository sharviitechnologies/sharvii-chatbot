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

// Loosened threshold to 0.6 so fuzzy search triggers easily on any question!
let fuse = new Fuse(content, { keys: ['title', 'body'], threshold: 0.6 });

app.get('/', (req, res) => {
  res.send('Sharvii Chatbot is running dynamically!');
});

// A background URL to let you refresh the bot's knowledge anytime by uploading or pulling content
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

    const prompt = `You are a helpful assistant for Sharvii Technologies, an NGO digital agency.
Answer questions using the site content below. If the information isn't detailed, mention the services comprehensively based on what you know.
If you don't know the answer at all, say: "Please contact us at info@sharviitechnologies.com or visit https://sharviitechnologies.com/contact/ for more details."

SITE CONTENT:
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
        model: 'claude-sonnet-4-6', 
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data && data.content && data.content[0] && data.content[0].text) {
      res.json({ reply: data.content[0].text });
    } else {
      // Fallback text directly mentioning the structural array services if search failed
      res.json({ reply: "Sharvii Technologies offers custom Websites, E-Commerce Stores, Mobile Apps, Learning Management Systems (LMS), CRM Solutions, Business WhatsApp API integration, Custom AI Chatbots, Social Media Handling, SEO, and complete Digital Marketing frameworks. How can I help you build your project?" });
    }

  } catch(e) {
    res.json({ reply: 'Connection reset. Please ask your question again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
