import Mailgen from "mailgen";
import nodemailer from "nodemailer";

// Nodemailer Transporter -> used to send
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: process.env.MAILTRAP_SMTP_PORT,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },
});

// Mailgen Object used for mail body generation
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Sutra - Project Manager",
    link: "https://sutra.com",
  },
});

const senEmail = async (options) => {
  const plainTextEmail = mailGenerator.generatePlaintext(
    options.mailgenContent,
  );
  const htmlEmail = mailGenerator.generate(options.mailgenContent);

  const mail = {
    from: "mail.project-manager@sutra.com",
    to: options.email,
    subject: options.subject,
    text: plainTextEmail,
    html: htmlEmail,
  };

  try {
    const info = await transporter.sendMail(mail);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Email service failed.");
    console.error({ message: error.message, stack: error.stack });
  }
};

const emailVerificationContent = (userName, verificationUrl) => {
  return {
    body: {
      name: userName,
      intro: "Welcome to Sutra! We're excited to have you on board.",
      action: {
        instructions:
          "To verify your email please click on the following button",
        button: {
          color: "#22bb66",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to bvvinaykumar45@gmail.com, we'd love to help.",
    },
  };
};

const forgotPasswordContent = (userName, passwordResetUrl) => {
  return {
    body: {
      name: userName,
      intro: "We got a request to reset the password of your account",
      action: {
        instructions:
          "To reset your password please click on the following button",
        button: {
          color: "#22bb66",
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to bvvinaykumar45@gmail.com, we'd love to help.",
    },
  };
};

export { emailVerificationContent, forgotPasswordContent, sendEmail };
