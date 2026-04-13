const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

const authRoutes = require("./routes/auth");
const weatherRoutes = require("./routes/weatherRoutes");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const Contact = require("./models/Contact");
const User = require("./models/user");
const MandiPrice = require("./models/MandiPrice");
const Subscriber = require("./models/Subscriber");

const app = express();

// ─── CORS ────────────────────────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://agriverse-in.vercel.app',
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://localhost:3000',
      'http://localhost:8080',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⛔ CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── DB ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/agri")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// ─── ADMIN MIDDLEWARE ────────────────────────────────────
function adminAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Not admin' });
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── EXISTING ROUTES ─────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api", weatherRoutes);

// ─── ADMIN LOGIN ──────────────────────────────────────────
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@agriverse.in";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AgriAdmin@2026";

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }
  const token = jwt.sign(
    { isAdmin: true, email },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '8h' }
  );
  res.json({ token, email });
});

// ─── ADMIN: DASHBOARD STATS ───────────────────────────────
app.get("/api/admin/stats", adminAuth, async (req, res) => {
  try {
    const [users, contacts, subscribers, mandiCities] = await Promise.all([
      User.countDocuments(),
      Contact.countDocuments(),
      Subscriber.countDocuments(),
      MandiPrice.countDocuments(),
    ]);
    // Recent 7 days registrations
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    const newContacts = await Contact.countDocuments({ createdAt: { $gte: weekAgo } });

    res.json({ users, contacts, subscribers, mandiCities, newUsers, newContacts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ADMIN: USERS ─────────────────────────────────────────
app.get("/api/admin/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/users/:id", adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ADMIN: CONTACTS ──────────────────────────────────────
app.get("/api/admin/contacts", adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/contacts/:id", adminAuth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ADMIN: SUBSCRIBERS ───────────────────────────────────
app.get("/api/admin/subscribers", adminAuth, async (req, res) => {
  try {
    const subs = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ADMIN: MANDI PRICES ──────────────────────────────────
app.get("/api/admin/mandi", adminAuth, async (req, res) => {
  try {
    const prices = await MandiPrice.find().sort({ city: 1 });
    res.json(prices);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/mandi", adminAuth, async (req, res) => {
  try {
    const { city, region, prices } = req.body;
    if (!city || !prices) return res.status(400).json({ error: "city & prices required" });
    const doc = await MandiPrice.findOneAndUpdate(
      { city },
      { city, region: region || 'Gujarat', prices, updatedBy: req.admin.email },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/mandi/:id", adminAuth, async (req, res) => {
  try {
    await MandiPrice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Public endpoint - frontend uses this for mandi prices
app.get("/api/mandi/prices", async (req, res) => {
  try {
    const prices = await MandiPrice.find().sort({ city: 1 });
    res.json(prices);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── CONTACT FORM ────────────────────────────────────────
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: "Name, email, and message are required" });

    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    try {
      await resend.emails.send({
        from: "Agri-Verse <onboarding@resend.dev>",
        to: "kavinjpatel104@gmail.com",
        subject: `📩 New Enquiry from ${name} - Agri-Verse`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;"><div style="background:#4CAF50;padding:20px;text-align:center;"><h2 style="color:#fff;margin:0;">🌿 Agri-Verse - New Enquiry</h2></div><div style="padding:25px;"><p><strong>👤 Name:</strong> ${name}</p><p><strong>📧 Email:</strong> ${email}</p><p><strong>📱 Phone:</strong> ${phone || "Not provided"}</p><p><strong>💬 Message:</strong></p><div style="background:#f5f5f5;padding:15px;border-radius:8px;border-left:4px solid #4CAF50;">${message}</div></div></div>`,
      });
    } catch (mailErr) {
      console.error("❌ Resend error:", mailErr.message);
    }

    res.status(201).json({ success: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── NEWSLETTER ──────────────────────────────────────────
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    // Save to DB
    try {
      await Subscriber.create({ email });
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        return res.status(200).json({ success: "Already subscribed" });
      }
    }

    await resend.emails.send({
      from: "Agri-Verse <onboarding@resend.dev>",
      to: "kavinjpatel104@gmail.com",
      subject: "📧 New Newsletter Subscriber - Agri-Verse",
      html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#4CAF50;">🌿 New Subscriber!</h2><p>📧 <strong>${email}</strong> subscribed to Agri-Verse newsletter.</p></div>`,
    });

    res.status(201).json({ success: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── CHAT (Gemini) ────────────────────────────────────────
const axios = require("axios");
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) return res.status(500).json({ error: "API key not configured" });

    const prompt = `You are Agri Assistant for Agri-Verse, an Indian farming platform. Answer ONLY about farming: seeds, fertilizers, weather, mandi prices, crop diseases, irrigation, soil, tools. Keep answers SHORT (2-4 lines). Reply in same language as user (English/Gujarati/Hindi). If off-topic say: "Hu sirf kheti vishe madadrup chu!" User: ${message}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 300 } },
      { headers: { "Content-Type": "application/json" } }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Mane samajyu nahi!";
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Chat service unavailable" });
  }
});

// ─── CROP DOCTOR (Gemini) ────────────────────────────────
app.post("/api/crop-doctor", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !messages.length) return res.status(400).json({ error: "Messages required" });

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) return res.status(500).json({ error: "API key not configured" });

    const lastMsg = messages[messages.length - 1];
    let promptText = "";
    let imagePart = null;

    if (Array.isArray(lastMsg.content)) {
      for (const part of lastMsg.content) {
        if (part.type === "text") promptText = part.text;
        if (part.type === "image") {
          imagePart = { inlineData: { mimeType: part.source.media_type, data: part.source.data } };
        }
      }
    } else {
      promptText = lastMsg.content;
    }

    const SYSTEM_PROMPT = `તમે "Crop Doctor" છો — Agri-Verse પ્લેટફોર્મ માટે એક નિષ્ણાત AI કૃષિ ડૉક્ટર.

તમારી ભૂમિકા:
- પાકના રોગો, જીવાત, પોષણની ઉણપ અને ખેતીની સમસ્યાઓનું નિદાન કરવું
- ખેડૂતોને સરળ અને વ્યવહારુ ઉપાય આપવા
- ભારતીય ખેતી, ખાસ કરીને ગુજરાત અને સ્થાનિક પાકોની સમજ રાખવી

જ્યારે છોડ/પાકની ઈમેજ આપવામાં આવે:
1. 🔍 **નિદાન**: રોગ અથવા સમસ્યા શું છે તે સ્પષ્ટ જણાવો
2. 🌱 **કારણ**: શા માટે થઈ શકે (ફૂગ, બેક્ટેરિયા, જીવાત, ઉણપ, વગેરે)
3. 💊 **ઉપાય**: તાત્કાલિક અને લાંબા ગાળાના ઉપાય જણાવો
4. 🧪 **દવા/ખાતર**: ચોક્કસ નામ અને માત્રા સાથે ભલામણ કરો
5. ⚠️ **સાવધાની**: જો કોઈ ગંભીર સ્થિતિ હોય તો ચેતવણી આપો

ભાષા નિયમ:
- User જે ભાષામાં પૂછે (ગુજરાતી/હિન્દી/English) તે જ ભાષામાં જવાબ આપો
- જવાબ સ્પષ્ટ, સંક્ષિપ્ત અને ખેડૂત-મૈત્રીપૂર્ણ હોવો જોઈએ
- ટેકનિકલ શબ્દો સમજાવો

માત્ર ખેતી સંબંધિત પ્રશ્નોના જ જવાબ આપો. અન્ય વિષય માટે કહો: "હું ફક્ત પાક અને ખેતીની સમસ્યાઓ માટે મદદ કરી શકું છું."`;

    const parts = [];
    if (imagePart) parts.push(imagePart);
    parts.push({ text: promptText });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts }],
        generationConfig: { maxOutputTokens: 1000 }
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Diagnosis unavailable.";
    res.json({ content: [{ type: "text", text }] });
  } catch (error) {
    console.error("Crop Doctor error:", error.response?.data || error.message);
    res.status(500).json({ error: "Crop Doctor service unavailable" });
  }
});

app.get("/", (req, res) => res.json({ message: "✅ Agri Backend Running!" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
