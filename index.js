const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const allowedOrigins = [
  'http://localhost:5173',          // for local dev
  'https://challa.netlify.app'      // for production frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET','POST','PUT','DELETE']
}));

app.use(express.json());


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter setup error:', error);
    } else {
        console.log('Email transporter is ready');
    }
});

app.get('/test-email', async (req, res) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test Email',
            text: 'This is a test email from the backend.'
        });
        res.send('Test email sent');
    } catch (error) {
        console.error('Failed to send test email:', error);
        res.status(500).send('Failed to send test email');
    }
});

app.post('/submit-form', async (req, res) => {
    const { name, email, message, subject } = req.body;
    console.log('📨 Form submitted by:', email);

    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: subject || 'New Form Submission',
        text: `You received a new message:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`
    };

    const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thanks for contacting me!',
        text: `Hi ${name},\n\nThank you for reaching out. I’ve received your message and will get back to you soon.\n\nBest,\nTharun Challa`
    };

    try {
        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);

        console.log('Both emails sent successfully');
        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ error: 'Failed to send emails', details: error.message });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
