import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465
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
        console.log(`Attempting to send email to: ${to} using port 465`);
        const info = await transporter.sendMail({
            from: `"mbdConsulting" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Detailed Email Error:", error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}