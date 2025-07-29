const express = require("express");
const router = express.Router();
const sendEmail = require("../sendEmail"); // Adjust path if needed

// Helper: Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper: Basic input sanitization
function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, "");
}

// Home page (GET /)
router.get("/", (req, res) => {
  res.render("index", {
    title: "Orion Web Studio",
  });
});

router.get("/contact", (req, res) => {
  res.render("contactUs", {
    title: "יצירת קשר",
  });
});

// About page (GET /about)
router.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us",
    message: "This is the About page.",
  });
});

router.get("/services", (req, res) => {
  res.render("services", {
    title: "About Us",
    message: "This is the About page.",
  });
});

// Contact form submit (POST /send)
router.post("/send", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, email, subject, and message are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      phone: phone ? sanitizeInput(phone) : "",
      subject: sanitizeInput(subject),
      message: message,
    };

    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `Customer Form Apllication: ${sanitizedData.subject}`,
      text: `
Contact Form Submission

Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Phone: ${sanitizedData.phone || "Not provided"}
Subject: ${sanitizedData.subject}

Message:
${sanitizedData.message}

---
Submitted at: ${new Date().toLocaleString()}
      `,
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitizedData.name}</p>
        <p><strong>Email:</strong> ${sanitizedData.email}</p>
        <p><strong>Phone:</strong> ${sanitizedData.phone || "Not provided"}</p>
        <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
        <h3>Message:</h3>
        <p>${sanitizedData.message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
      `,
    });

    console.log(`Email sent successfully from ${sanitizedData.email}`);
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.error("Failed to send email:", err);

    const errorMessage =
      err.code === "EAUTH"
        ? "Authentication failed. Please check email credentials."
        : "Email sending failed. Please try again later.";

    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

module.exports = router;
