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
  res.send('Sharvii Dynamic AI Engine is Active!');
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const systemPrompt = `You are the official conversational AI plugin for Sharvii Technologies (https://sharviitechnologies.com), an NGO digital agency.
Answer the user's questions dynamically, smartly, and professionally using your comprehensive knowledge base.

OFFICIAL CONTACT INFORMATION:
- Support Email: support@sharvii.com
- Contact Page Link: https://sharviitechnologies.com/contact-us/
- Phone & Direct WhatsApp Chat: https://wa.me/919739006477 (+91 97390 06477)

BUSINESS VALUES:
We design and develop custom websites, mobile applications, e-learning platforms, and donor management CRM setups exclusively for non-profits and mission-driven organizations to grow their digital impact.

If a user asks about pricing, packages, or specific technical integrations, give an intelligent general answer and invite them to click our WhatsApp link or visit our /contact-us/ page to book a detailed briefing.`;

    // Calling the exact API endpoint with your active console balance parameters
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', 
        max_tokens: 800,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\nUser Question: ${message}` }
        ]
      })
    });

    const data = await response.json();

    if (data && data.content && data.content[0] && data.content[0].text) {
      return res.json({ reply: data.content[0].text });
    }

    if (data && data.error) {
      return res.json({ reply: `Notice: ${data.error.message}. Please verify your key properties.` });
    }

    res.json({ reply: "Checking connections. Please resend your message in a brief moment." });

  } catch(e) {
    console.error("Plugin operational failure:", e);
    res.json({ reply: "The connection timed out. Please try your message once more." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Plugin Engine live on port ${PORT}`));
