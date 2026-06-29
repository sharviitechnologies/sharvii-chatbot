require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path'); // <-- FIX 1: Added path module

const app = express();
app.use(cors());
app.use(express.json());

// <-- FIX 2: Serve the public folder statically
app.use(express.static(path.join(__dirname, 'public'))); 

const content = JSON.parse(fs.readFileSync('content.json', 'utf8'));
const fuse = new Fuse(content, { keys: ['title', 'body'], threshold: 0.4 });

app.get('/', (req, res) => {
  res.send('Sharvii Chatbot is running!');
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const results = fuse.search(message).slice(0, 3);
    const context = results.map(r => `Page: ${r.item.title}\nURL: ${r.item.url}\n${r.item.body.slice(0, 600)}`).join('\n\n---\n\n');

    const prompt = `You are a helpful assistant for Sharvii Technologies, an NGO digital agency.
Answer questions using ONLY the content below.
If the answer is not in the content, say "Please contact us at https://sharviitechnologies.com/contact-us/ for more details. or say "For more info email support@sharvii.com or call +91 97390 06477". Never use markdown formatting like ** or [] or (). Give plain text answers only."
Keep answers short, friendly and helpful.

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
        model: 'claude-sonnet-4-6', // Note: Made sure the model string matches Claude's typical naming structure
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    res.json({ reply: data.content[0].text });
  } catch(e) {
    console.error(e); // Good for debugging in Railway console logs
    res.json({ reply: 'Sorry, something went wrong. Please try again.' });
  }
});

// <-- FIX 3: Use Railway's dynamic port environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
