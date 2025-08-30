const nodemailer = require("nodemailer");

const sendWelcomeEmail = async ({ name, email }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Rick Dresses 👗" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎉 স্বাগতম ${name}, Rick Dresses এ!`,
    html: `
      <div style="max-width: 600px; margin: auto; font-family: 'Noto Sans Bengali', Arial, sans-serif; background: #fff3e0; padding: 25px; border-radius: 12px; border: 1px solid #ff9800; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; padding-bottom: 15px; border-bottom: 2px solid #ff9800;">
          <h1 style="color: #e65100; font-size: 28px; margin: 0;">👗 Rick Dresses</h1>
          <p style="color: #555; font-size: 14px; margin-top: 5px;">আপনার প্রিয় ফ্যাশন গন্তব্য</p>
        </div>

        <!-- Greeting -->
        <div style="padding: 20px 10px;">
          <h2 style="color: #e65100; font-size: 22px; margin-bottom: 10px;">হ্যালো ${name},</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            🎉 <b>Rick Dresses</b> পরিবারের নতুন সদস্য হিসেবে আপনাকে স্বাগতম!  
            আমরা আনন্দিত যে আপনি আমাদের সাথে যুক্ত হয়েছেন।  
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            এখনই এক্সপ্লোর করুন আমাদের <b>সর্বশেষ ফ্যাশন কালেকশন</b> এবং আপনার পছন্দের পোশাক কিনুন।  
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://rickdresses.vercel.app" target="_blank" style="background-color: #e65100; color: #fff; padding: 12px 25px; border-radius: 8px; font-size: 16px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 3px 8px rgba(230,81,0,0.3);">
            🛍️ এখনই শপিং শুরু করুন
          </a>
        </div>

        <!-- Footer -->
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center;">
          <p style="font-size: 14px; color: #666; margin: 0;">
            ❤️ ধন্যবাদ আমাদের সাথে যুক্ত থাকার জন্য!  
            <br/>শুভেচ্ছান্তে,  
            <b>Rick Dresses টিম</b> 👗
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;
