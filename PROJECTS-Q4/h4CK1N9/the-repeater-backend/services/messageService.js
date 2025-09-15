const twilio = require('twilio');
const nodemailer = require('nodemailer');
const Message = require('../models/Message');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendMessage = async (type, target, messageContent) => {
  try {
    if (type === 'phone') {
      await client.messages.create({
        body: messageContent,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: target.phone,
      });
    } else if (type === 'text') {
      await client.messages.create({
        body: messageContent,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: target.phone,
      });
    } else if (type === 'email') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: target.email,
        subject: 'Your Subject Here',
        text: message
