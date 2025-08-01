const nodemailer = require("nodemailer");

const sendWelcomeEmail = async ({ name, email }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use Mailtrap for dev
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Rick Dresses 👗" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎉 Welcome to Rick Dresses, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; background:#fff3e0; padding:20px; border-radius:8px;">
        <h2 style="color:#e65100;">Hi ${name},</h2>
        <p>Thanks for joining <b>Rick Dresses</b>! We're super excited to have you.</p>
        <p>Explore the trendiest fashion now! 🎀</p>
        <p style="margin-top:30px;">With love,<br/>The Rick Dresses Team 👗</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;
