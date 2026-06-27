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

// Serve the public folder statically
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
If the answer is not in the content, say "Please contact us at https://sharviitechnologies.com/contact/ for more details."
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
        model: 'claude-3-5-sonnet-latest', // <-- FIXED THIS LINE TO CHOOSE THE ACTIVE MODEL ID
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    
    // Debugging print to help see what Claude returns in your Railway logs
    console.log("Anthropic API Response:", JSON.stringify(data));

    // FIX: Bulletproof property check to make sure it doesn't crash if 'data.content' is undefined
    if (data && data.content && data.content[0] && data.content[0].text) {
      res.json({ reply: data.content[0].text });
    } else if (data && data.error && data.error.message) {
      // If Claude returns an API error configuration status (e.g., billing, wrong key)
      res.json({ reply: `API Error: ${data.error.message}` });
    } else {
      res.json({ reply: 'Sorry, I couldn\'t process the response structure from Claude.' });
    }

  } catch(e) {
    console.error("Server catch block error:", e); 
    res.json({ reply: 'Sorry, something went wrong. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
