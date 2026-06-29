require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 

// Load local database data safely
let content = [];
try {
  content = JSON.parse(fs.readFileSync('content.json', 'utf8'));
} catch (e) {
  content = [
    { title: "services", body: "We provide Web Design & Development, Digital Marketing (SEO & Social Media), Branding & Graphic Design, Content Creation, Custom Software/CRM Solutions, and Fundraising support for NGOs." },
    { title: "contact", body: "You can reach us via email at support@sharvii.com or call/WhatsApp us at +91 97390 06477." }
  ];
}

let fuse = new Fuse(content, { keys: ['title', 'body'], threshold: 0.5 });

app.get('/', (req, res) => {
  res.send('Sharvii Chatbot is running locally!');
});

app.post('/chat', (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    // 1. Instant Smart Local Matching
    if (lowerMsg.includes('service') || lowerMsg.includes('what u provide') || lowerMsg.includes('platform')) {
      return res.json({
        reply: "At Sharvii Technologies, we provide a comprehensive range of digital services tailored for NGOs:\n\n" +
               "• Web Design & Development (Custom, mobile-responsive websites)\n" +
               "• Digital Marketing (SEO, Social Media management, and online outreach)\n" +
               "• Branding & Graphic Design (Logos and visual brand identities)\n" +
               "• Content Creation (Copywriting, impact storytelling, and newsletters)\n" +
               "• Technology Solutions (Custom software, mobile apps, LMS stores, and CRM tools)\n" +
               "• Fundraising Support (Crowdfunding and donor engagement strategies)\n\n" +
               "For inquiries, visit our team at: https://sharviitechnologies.com/contact-us/"
      });
    }

    // UPDATED: Correct support channels with WhatsApp redirect and correct contact-us URL
    if (lowerMsg.includes('contact') || lowerMsg.includes('number') || lowerMsg.includes('email') || lowerMsg.includes('phone') || lowerMsg.includes('whatsapp')) {
      return res.json({
        reply: "You can easily get in touch with our team at Sharvii Technologies:\n\n" +
               "✉️ Email: support@sharvii.com\n" +
               "📞 Phone / WhatsApp: https://wa.me/919739006477 (+91 97390 06477)\n" +
               "🌐 Official Contact Page: https://sharviitechnologies.com/contact-us/\n\n" +
               "Click the WhatsApp link above or drop us an email, and we will get back to you shortly!"
      });
    }

    if (lowerMsg.includes('impact')) {
      return res.json({
        reply: "Our Impact page showcases how Sharvii Technologies helps non-profits amplify their mission. " +
               "We have worked with 370+ organizations globally across India, the US, Europe, and Australia to build " +
               "sustainable technology for the social sector. Explore our full portfolio work here: https://sharviitechnologies.com/"
      });
    }

    // 2. Fallback matching engine
    const results = fuse.search(message);
    if (results.length > 0) {
      return res.json({ reply: results[0].item.body });
    }

    res.json({
      reply: "I want to make sure you get the right details! For specific questions about our NGO solutions, reach out directly to support@sharvii.com or ping us via WhatsApp here: https://wa.me/919739006477"
    });

  } catch(e) {
    res.json({ reply: 'The system is updating. Please try asking your question again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Local Engine running on port ${PORT}`));
