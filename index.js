const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Resend } = require("resend");

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.ADMIN_EMAIL,
      subject: "Test Email",
      html: "<p>This is a test email from Resend</p>"
    });

    res.send("Test email sent successfully");
  } catch (error) {
    res.status(500).send("Failed to send email");
  }
});

app.post("/submit-form", async (req, res) => {
  const { name, email, message, subject } = req.body;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.ADMIN_EMAIL,
      subject: subject || "New Form Submission",
      html: `
        <h3>New Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    });

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Thanks for contacting me!",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out. I have received your message and will get back to you soon.</p>
        <p>Best,<br/>Tharun Challa</p>
      `
    });

    res.json({ success: true, message: "Emails sent successfully" });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
