import nodemailer from 'nodemailer';
import pug from 'pug';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = 'Rounak_Nodemailer@project.io';
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: '3a56855cca69c0',
          pass: 'd017136aa14729',
        },
      });
    }
  }

  async send(template, subject) {
    const templatePath = join(
      __dirname,
      '..',
      'views',
      'emails',
      `${template}.pug`,
    );
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //2) Define the email options
    const mailOptions = {
      from: this.from, // Sender address
      to: this.to, // Receiver address
      subject, // Subject line
      html,
      // text: htmlToText.fromString(html), // Plain text body
    };
    //3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to Voyago!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token(Valid for only 10 minutes)',
    );
  }

  async sendConfirmation() {
    await this.send('tourConfirmation', 'Your tour has been confirmed');
  }
}
