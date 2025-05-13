const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    console.log(process.env.MAIL_HOST);
    console.log(process.env.MAIL_USER);
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from: 'DocSure',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });
        return info;
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;