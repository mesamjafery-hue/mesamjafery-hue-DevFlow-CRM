const nodemailer = require('nodemailer');
const config = require('../config');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: parseInt(config.email.port) || 587,
  secure: parseInt(config.email.port) === 465, // true for 465, false for other ports
  auth: config.email.user
    ? {
        user: config.email.user,
        pass: config.email.pass,
      }
    : undefined,
  // Fail fast instead of hanging when SMTP is unreachable or credentials are wrong.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

/**
 * Send an email to a recipient using the configured SMTP server.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 * @returns {Promise<object>} nodemailer send result
 */
const sendEmail = async (to, subject, html) => {
  if (!config.email.host) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
  }

  const mailOptions = {
    from: config.email.from || config.email.user,
    to, // sends to whatever address is passed in
    subject,
    html,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to}: ${result.messageId}`);
  return result;
};

// Email templates
const sendVerificationEmail = (to, name, token) => {
  const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;
  return sendEmail(
    to,
    'Verify your email - DevFlow CRM',
    `
    <h2>Welcome, ${name}!</h2>
    <p>Thanks for registering with DevFlow CRM. Please verify your email address by clicking the link below:</p>
    <p><a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Verify Email</a></p>
    <p>Or paste this token into the verification page:</p>
    <p><code>${token}</code></p>
    <p>This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
  `
  );
};

/**
 * Send the 6-digit sign-in verification code to the account owner's email address.
 * @param {string} to - Recipient email address (the address the user signed up with)
 * @param {string} name - Recipient display name
 * @param {string} code - 6-digit verification code
 */
const sendLoginCodeEmail = (to, name, code) => {
  return sendEmail(
    to,
    'Your DevFlow CRM sign-in code',
    `
    <h2>Hi ${name || 'there'},</h2>
    <p>Use the verification code below to finish signing in to DevFlow CRM:</p>
    <p style="font-size:30px;font-weight:700;letter-spacing:8px;margin:18px 0;">${code}</p>
    <p>This code expires in 10 minutes. If you didn't try to sign in, you can safely ignore this email.</p>
  `
  );
};

const sendPasswordResetEmail = (to, name, token) => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  return sendEmail(
    to,
    'Password Reset - DevFlow CRM',
    `
    <h2>Password Reset Request</h2>
    <p>Hi ${name}, we received a request to reset your password. Click the link below to choose a new one:</p>
    <p><a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>
    <p>Or paste this token into the reset page:</p>
    <p><code>${token}</code></p>
    <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `
  );
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendLoginCodeEmail,
  sendPasswordResetEmail,
};
