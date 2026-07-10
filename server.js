require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Sharvii Chatbot is running!');
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3,
            allowed_domains: ['sharviitechnologies.com']
          }
        ],
        system: `You are a helpful assistant for Sharvii Technologies (sharviitechnologies.com), an NGO digital agency since 2012.
RULES:
- Only answer about Sharvii Technologies
- Search sharviitechnologies.com to find answers
- Keep answers under 50 words
- For service lists show max 4 items, numbered, one line each
- No long paragraphs
- No markdown symbols like ** or []
- For contact say: Email: support@sharvii.com | Call: +91 97390 06477
- If not found say: I don't have that info. Email support@sharvii.com or call +91 97390 06477`,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    let reply = '';
    if (data.content) {
      for (const block of data.content) {
        if (block.type === 'text') reply += block.text;
      }
    }
    if (!reply) reply = "I don't have that info. Email support@sharvii.com or call +91 97390 06477";
    res.json({ reply });
  } catch(e) {
    console.error(e);
    res.json({ reply: 'Sorry, something went wrong. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));