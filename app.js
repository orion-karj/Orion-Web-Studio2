const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const mainRoutes = require("./routes/mainRoutes");

dotenv.config({ path: "./config.env" });

const app = express();
const PORT = process.env.PORT || 5000;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Use all page + API routes from router
app.use("/", mainRoutes);

app.post("/send", async (req, res) => {
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
      message: sanitizeInput(message),
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

// Global error handling
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📧 Email service ready with user: ${process.env.EMAIL_USER}`);
});
