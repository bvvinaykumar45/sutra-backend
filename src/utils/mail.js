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

export { emailVerificationContent, forgotPasswordContent };
