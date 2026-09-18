import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
    const password = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s+/g, "") : "";
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        service: process.env.SMTP_SERVICE || "gmail",
        secure: true,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: password,
        },
    });

    const mailOptions = {
        from: `"Rohit App" <${process.env.SMTP_MAIL}>`,
        to: email,
        subject: subject,
        html: message,
    };

    await transporter.sendMail(mailOptions);
};