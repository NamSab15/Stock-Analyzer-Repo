const nodemailer = require('nodemailer');

function makeMailer() {
  // Basic nodemailer configuration using environment variables
  const host = process.env.SMTP_HOST || 'smtp.example.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = (process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  // verify transporter connectivity early
  transporter.verify().then(() => {
    console.log('✅ Mailer configured');
  }).catch((err) => {
    console.warn('Mailer verify error:', err?.message || err);
  });

  return transporter;
}

module.exports = makeMailer;
