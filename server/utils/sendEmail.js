import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Add timeouts to prevent hangs in production
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 15000      // 15 seconds
})

export const sendEmail = async (to, subject, html) => {
    try {
        console.log(`Attempting to send email to: ${to}`);
        const info = await transporter.sendMail({
            from: `"mbdConsulting" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email Sending Error:", error);
        throw new Error("Failed to send email. Please check server logs.");
    }
}