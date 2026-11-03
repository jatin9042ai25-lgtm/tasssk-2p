const express = require("express");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
const path = require("path");
const fs = require("fs");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const subscribersFile = path.join(__dirname, "subscribers.json");

app.use(express.json());
app.use(express.static(__dirname));

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function readSubscribers() {
  try {
    return JSON.parse(fs.readFileSync(subscribersFile, "utf8"));
  } catch (error) {
    return [];
  }
}

app.post("/subscribe", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const subscribers = readSubscribers();
  if (subscribers.includes(email)) {
    return res.status(409).json({ message: "This email is already subscribed." });
  }

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
    return res.status(500).json({ message: "Email service is not configured. Please check the server settings." });
  }

  const emailMessage = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: "Welcome to the Daily Insider",
    text: "Thank you for subscribing to the Daily Insider. We are happy to have you with us!"
  };

  try {
    const [sendGridResponse] = await sgMail.send(emailMessage);
    subscribers.push(email);
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
    console.log("SendGrid status:", sendGridResponse.statusCode);
    console.log("Welcome email sent to:", email);
    return res.status(202).json({ message: "Thank you for subscribing! Your welcome email has been sent." });
  } catch (error) {
    console.error("Email error:", error.response?.body || error.message);
    return res.status(500).json({ message: "Sorry, the welcome email could not be sent." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
