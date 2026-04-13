const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// ================= SEND EMAIL =================
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Event Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })
  } catch (err) {
    console.error("EMAIL ERROR:", err.message)
  }
}

module.exports = {
  sendEmail
}