import nodemailer from "nodemailer";
import dotenv from "dotenv";

export const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Configure nodemailer

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail account
        pass: process.env.EMAIL_PASS, // Your Gmail password or App password
      },
    });

    // Set up the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO, // Your email address to receive the messages
      subject: `Contact Form Submission from ${name}`,
      text: `Message: ${message}
      
      Respond to: ${email}`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Email sent successfully", info });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};
