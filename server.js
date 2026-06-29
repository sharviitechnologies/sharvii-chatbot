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
  res.send('Sharvii Plugin Engine is Online!');
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Direct instructions informing the AI who it is and providing the core business credentials
    const systemPrompt = `You are the official conversational AI assistant for Sharvii Technologies (https://sharviitechnologies.com), an NGO digital agency.
Your goal is to assist visitors dynamically with any questions they have about our services, platforms, work, or company.

OFFICIAL CHANNELS & DETAILS:
- Support Email: support@sharvii.com
- Contact Page: https://sharviitechnologies.com/contact-us/
- Phone & WhatsApp Redirect: https://wa.me/919739006477 (+91 97390 06477)

Core Business Profile: We build websites, platforms, custom mobile apps, LMS stores, donor management CRM tools, and run digital fundraising/marketing campaigns tailored specially for non-profits and NGOs since 2012.

INSTRUCTIONS:
1. Be helpful, professional, and friendly.
2. Answer the user's question directly and dynamically using your vast knowledge base.
3. When the user wants to get in touch, provide the clickable email, contact-us link, or WhatsApp redirect link provided above.`;

    // Make a live call to Anthropic using your newly active balance account credits
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-latest', 
        max_tokens: 600,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\nUser Question: ${message}` }
        ]
      })
    });

    const data = await response.json();

    // If the API call is successful, return the AI response directly to the frontend window widget
    if (data && data.content && data.content[0] && data.content[0].text) {
      return res.json({ reply: data.content[0].text });
    }

    // Error logging fallback if there's any key sync latency on the console
    if (data && data.error) {
      return res.json({ reply: `Notice: ${data.error.message}. Please verify your key configuration.` });
    }

    res.json({ reply: "I'm processing your request. Please ask your question once more!" });

  } catch(e) {
    console.error("Plugin Connection Error:", e);
    res.json({ reply: "Connection temporarily interrupted. We'll be right back!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Live Plugin Engine active on port ${PORT}`));
