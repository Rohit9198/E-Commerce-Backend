import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
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