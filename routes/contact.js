const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();

// POST /contact/send
router.post('/send', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ID,   // Your Gmail
        pass: process.env.EMAIL_APP_PASSWORD,     // App Password (Not your Gmail password)
      }
    });

    await transporter.sendMail({
      from: '"Website Contact" <sectionsync@gmail.com>',
      to: 'sectionsync@gmail.com',
      subject: `New Contact Message from ${name}`,
      html: `
        <h3>Contact Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `
    });

    res.status(200).send('Message Sent');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending message');
  }
});

module.exports = router;
