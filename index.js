const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

const allowedOrigins = [
  "https://challa.netlify.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS not allowed for this origin"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.options("*", cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((err, success) => {
  if (err) console.error("Email transporter setup error:", err);
  else console.log("Email transporter is ready");
});

app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "This is a test email from backend."
    });
    res.json({ message: "Test email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send test email" });
  }
});

app.post("/submit-form", async (req, res) => {
  const { name, email, subject, message } = req.body;

  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: subject || "New Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`
  };

  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thanks for contacting me!",
    text: `Hi ${name},\n\nThank you for reaching out. I’ll get back to you soon.\n\nBest,\nTharun Challa`
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(200).json({ message: "Emails sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send emails", details: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
