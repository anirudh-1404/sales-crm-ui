import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
    try {
        console.log(`Attempting to send email to: ${to} using Resend API`);

        // Note: Unless a domain is verified in Resend, you can only send to the email 
        // associated with the account, or use onboarding@resend.dev as the 'from' address.
        const { data, error } = await resend.emails.send({
            from: 'SalesCRM <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("Resend API Error:", error);
            throw new Error(error.message);
        }

        console.log("Email sent successfully via Resend:", data.id);
        return data;
    } catch (error) {
        console.error("Detailed Email Error:", error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}