const nodemailer = require('nodemailer');
const config = require('../../config.json')

class MailService {
  sendEmail(email, text, subject) {
    const transporter = nodemailer.createTransport({
      host: config.email_smtp,
      port: config.email_port,
      secure: true, // используется SSL
      auth: {
        user: config.email_user,
        pass: config.email_pass
      }
    });
    const mailOptions = {
      from: config.email_user,
      to: email,
      subject: subject,
      text: text
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email отправлен: ' + info.response);
      }
    });
  }
}

module.exports = new MailService()