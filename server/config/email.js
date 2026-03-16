const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"UNISOLE" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email error:", error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;