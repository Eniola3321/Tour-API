import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name;
    this.url = url;
    this.from = `Jonas <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Activate in Gmail "less secure app" option
    });
  }
  //send actual email
  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      { firstName: this.firstName, url: this.url, subject },
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText(html),
    };
    console.log('Sending email to:', this.to, 'with subject:', subject);
    try {
      const result = await this.newTransport().sendMail(mailOptions);
      console.log('Email sent successfully:', result);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Re-throw to be caught in controller
    }
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
}

/*const sendEmail = async (Options) => {
  //1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in Gmail "less secure app" option
  });
  //2) Define the email options
  const mailOptions = {
    from: 'Jonas <admin@natours.io>',
    to: Options.email,
    subject: Options.subject,
    text: Options.message,
  };
  //3)Actually send the email with node mailer
  await transporter.sendMail(mailOptions);
}; 
// export default sendEmail; */
