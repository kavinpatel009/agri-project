const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./routes/auth");
const weatherRoutes = require("./routes/weatherRoutes");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const Contact = require("./models/Contact");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://localhost:3000',
      'http://localhost:8080',
      'https://bright-empanada-efc28c.netlify.app'
    ];
    // Allow all vercel.app domains
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/agri")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", weatherRoutes);  // weather & forecast & locations

// Email Transporter
// Resend API initialized above

// Contact Form Route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    // Save to MongoDB
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

        try {
      // Send to admin
      await resend.emails.send({
        from: "Agri-Verse <onboarding@resend.dev>",
        to: "kavinjpatel104@gmail.com",
        subject: `📩 New Enquiry from ${name} - Agri-Verse`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
            <div style="background:#4CAF50;padding:20px;text-align:center;">
              <h2 style="color:#fff;margin:0;">🌿 Agri-Verse - New Enquiry</h2>
            </div>
            <div style="padding:25px;">
              <p><strong>👤 Name:</strong> ${name}</p>
              <p><strong>📧 Email:</strong> ${email}</p>
              <p><strong>📱 Phone:</strong> ${phone || "Not provided"}</p>
              <p><strong>💬 Message:</strong></p>
              <div style="background:#f5f5f5;padding:15px;border-radius:8px;border-left:4px solid #4CAF50;">${message}</div>
            </div>
          </div>
        `,
      });

      // Note: User confirmation requires verified domain on Resend paid plan

      console.log("✅ Emails sent via Resend!");
    } catch (mailErr) {
      console.error("❌ Resend error:", mailErr.message);
    }

    res.status(201).json({ success: "Message sent successfully" });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Newsletter Route
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    await resend.emails.send({
      from: "Agri-Verse <onboarding@resend.dev>",
      to: "kavinjpatel104@gmail.com",
      subject: "📧 New Newsletter Subscriber - Agri-Verse",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
          <div style="background:#4CAF50;padding:20px;text-align:center;">
            <h2 style="color:#fff;margin:0;">🌿 Agri-Verse - New Subscriber!</h2>
          </div>
          <div style="padding:25px;">
            <p>📧 <strong>New subscriber:</strong> ${email}</p>
            <p style="color:#888;">They subscribed to your newsletter!</p>
          </div>
        </div>
      `,
    });

    console.log("✅ Newsletter subscription:", email);
    res.status(201).json({ success: "Subscribed successfully" });
  } catch (error) {
    console.error("Newsletter error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Health Check
app.get("/", (req, res) => res.json({ message: "✅ Agri Backend Running!" }));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
