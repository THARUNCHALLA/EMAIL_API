const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Resend } = require("resend");

const app = express();

const allowedOrigins = ["https://challa.netlify.app"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS blocked"));
  },
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.list().catch(() => {});

app.get("/", (req, res) => {
  res.send("API Running ");
});

app.get("/test-email", async (req, res) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.ADMIN_EMAIL,
      subject: "Test Email",
      html: "<p>This is a test email from Resend</p>"
    });
    res.send("Test email sent successfully ✅");
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/submit-form", (req, res) => {
  const { name, email, message, subject } = req.body;

  res.json({ success: true, message: "Message received ✅" });

  resend.emails.send({
    from: "onboarding@resend.dev",
    to: process.env.ADMIN_EMAIL,
    subject: subject || "New Form Submission",
    html: `
      <h3>New Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `
  }).catch(err => console.error("Admin email failed:", err.message));

  resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Thanks for contacting me!",
    html: `
      <p>Hi ${name},</p>
      <p>Thank you for reaching out. I have received your message and will get back to you soon.</p>
      <p>Best,<br/>Tharun Challa</p>
    `
  }).catch(err => console.error("Auto-reply failed:", err.message));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
