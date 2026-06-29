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
    { title: "contact", body: "You can reach us via email at info@sharviitechnologies.com or visit our official page at https://sharviitechnologies.com/contact/" }
  ];
}

// Configure loose search matching parameters
let fuse = new Fuse(content, { keys: ['title', 'body'], threshold: 0.5 });

app.get('/', (req, res) => {
  res.send('Sharvii Chatbot is running locally!');
});

app.post('/chat', (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    // 1. Instant Smart Local Matching (Bypasses API Errors)
    if (lowerMsg.includes('service') || lowerMsg.includes('what u provide') || lowerMsg.includes('platform')) {
      return res.json({
        reply: "At Sharvii Technologies, we provide a comprehensive range of digital services tailored for NGOs:\n\n" +
               "• Web Design & Development (Custom, mobile-responsive websites)\n" +
               "• Digital Marketing (SEO, Social Media management, and online outreach)\n" +
               "• Branding & Graphic Design (Logos and visual brand identities)\n" +
               "• Content Creation (Copywriting, impact storytelling, and newsletters)\n" +
               "• Technology Solutions (Custom software, mobile apps, LMS stores, and CRM tools)\n" +
               "• Fundraising Support (Crowdfunding and donor engagement strategies)\n\n" +
               "For inquiries, visit: https://sharviitechnologies.com/contact/"
      });
    }

    if (lowerMsg.includes('contact') || lowerMsg.includes('number') || lowerMsg.includes('email')) {
      return res.json({
        reply: "You can easily get in touch with our team at Sharvii Technologies:\n\n" +
               "✉️ Email: info@sharviitechnologies.com\n" +
               "🌐 Official Contact Page: https://sharviitechnologies.com/contact/\n\n" +
               "Drop us a line and we will get back to you shortly!"
      });
    }

    if (lowerMsg.includes('impact')) {
      return res.json({
        reply: "Our Impact page showcases how Sharvii Technologies helps non-profits amplify their mission. " +
               "We have worked with 370+ organizations globally across India, the US, Europe, and Australia to build " +
               "sustainable technology for the social sector. Explore our full portfolio work here: https://sharviitechnologies.com/"
      });
    }

    // 2. Fuse.js fallback search if no main keyword matches
    const results = fuse.search(message);
    if (results.length > 0) {
      return res.json({ reply: results[0].item.body });
    }

    // Default friendly response
    res.json({
      reply: "I want to make sure you get the right details! For specific questions about our NGO solutions, check out our site details or contact our helpdesk at info@sharviitechnologies.com."
    });

  } catch(e) {
    res.json({ reply: 'The system is updating. Please try asking your question again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Local Engine running on port ${PORT}`));
