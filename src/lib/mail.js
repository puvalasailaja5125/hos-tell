import nodemailer from "nodemailer";

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export async function sendResetEmail(to, name, link) {
  // No email server configured: print the link so you can test locally
  if (!process.env.SMTP_HOST) {
    console.log(`\n[DEV] Password reset link for ${to}:\n${link}\n`);
    return;
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your Hos-Tell password",
    text: `Hi ${name},\n\nUse this link to set a new password (valid for 30 minutes):\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
    html: `<p>Hi ${escapeHtml(name)},</p>
<p>Use the button below to set a new password. The link is valid for 30 minutes.</p>
<p><a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Reset password</a></p>
<p>If you did not ask for this, you can ignore this email.</p>`,
  });
}