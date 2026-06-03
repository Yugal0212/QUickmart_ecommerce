const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = (to, subject, text) => {
  // Fire and forget background execution
  transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text }).catch(err => {
    console.error('Background Email Error:', err);
  });
};

module.exports = sendEmail;
