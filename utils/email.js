const nodemailer = require('nodemailer');
const fs = require('fs/promises');
const htmlToText = require('html-to-text');
const ejs = require('ejs');
const path = require('path');


module.exports = class Email {
    constructor(user, code) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.code = code;
        this.from = process.env.EMAIL_USERNAME_Gmail;
    }
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //sendgrid
        }
        return nodemailer.createTransport({
            service: 'gmail',
            host: process.env.EMAIL_HOST_Gmail,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_USERNAME_Gmail,
                pass: process.env.EMAIL_PASSWORD_Gmail,
            },
        });
    }
    async send(html, subject) {
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html,
            text: htmlToText.convert(html),
        };
        await this.newTransport().sendMail(mailOptions);
    }

    async sendResetPassword() {
        const html = await ejs.renderFile(
            path.join(__dirname, '../views', 'resetPassword.ejs'),
            {
                firstName: this.firstName,
                code: this.code
            }
        );
        await this.send(html, 'Reset Your Password');
    }

    async verifyEmail() {
        const html = await ejs.renderFile(
            path.join(__dirname, '../views', 'verifyEmail.ejs'),
            {
                firstName: this.firstName,
                code: this.code
            }
        );
        await this.send(html, 'Verify Your Email');
    }
};
