import nodemailer from 'nodemailer';
const sendEmail = async (Options) => {
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
export default sendEmail;
