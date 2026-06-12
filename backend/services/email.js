// services/email.js – Envoi d'emails (vérification, réinitialisation)
// version corrigée : fonctionne MÊME si l'email n'est pas encore configuré

const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// L'email n'est considéré comme configuré que si les deux variables existent.
const emailConfigured = Boolean(EMAIL_USER && EMAIL_PASS);

let transporter = null;
if (emailConfigured) {
  transporter = nodemailer.createTransport({
    service: 'gmail', // ou 'hotmail', 'yahoo', etc.
    auth: {
      user: EMAIL_USER, // votre adresse email
      pass: EMAIL_PASS, // mot de passe d'application
    },
  });
} else {
  console.warn(
    '⚠️  EMAIL_USER / EMAIL_PASS non configurés : aucun email ne sera envoyé. ' +
    'Les codes de vérification et liens seront affichés dans les logs (utile pour tester).'
  );
}

/**
 * Envoie un email. Si l'email n'est pas configuré, on n'envoie rien
 * (mais on ne plante pas non plus).
 */
async function sendEmail({ to, subject, html }) {
  if (!emailConfigured) {
    console.log(`📭 [EMAIL NON CONFIGURÉ] Aurait envoyé à ${to} — sujet : "${subject}"`);
    return { skipped: true };
  }

  const mailOptions = {
    from: `"Famille & Fraîcheur" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email envoyé à ${to} : ${info.messageId}`);
  return info;
}

/**
 * Envoie l'email de vérification avec le code.
 * Si l'email n'est pas configuré, le code est affiché dans les logs
 * pour permettre de tester l'inscription (lisible dans les logs Railway).
 */
async function sendVerificationEmail(to, code) {
  if (!emailConfigured) {
    console.log(`🔐 [CODE DE VÉRIFICATION] ${to} → ${code}`);
  }

  const html = `
    <h2>Vérification de votre compte</h2>
    <p>Voici votre code de vérification :</p>
    <h1 style="color:#2E7D32;">${code}</h1>
    <p>Ce code expire dans 1 heure.</p>
  `;
  return sendEmail({ to, subject: 'Famille & Fraîcheur - Code de vérification', html });
}

/**
 * Envoie le lien de réinitialisation de mot de passe.
 * Si l'email n'est pas configuré, le lien est affiché dans les logs.
 */
async function sendPasswordResetEmail(to, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;

  if (!emailConfigured) {
    console.log(`🔑 [LIEN DE RÉINITIALISATION] ${to} → ${resetUrl}`);
  }

  const html = `
    <h2>Réinitialisation de mot de passe</h2>
    <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>Ce lien expire dans 1 heure.</p>
  `;
  return sendEmail({ to, subject: 'Famille & Fraîcheur - Réinitialisation du mot de passe', html });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };