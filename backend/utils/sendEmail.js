const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const sendEmail = async (options) => {
  try {
    //create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Ensure that the options object contains the email recipient(s)
    if (!options.email) {
      throw new Error("Recipient email address is missing");
    }

    //define the options
    const mailOptions = {
      from: '"Farmers" <Farmers@org.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    //send the email
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendEmail;
