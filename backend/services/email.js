const nodemailer = require('nodemailer');

// Crée un transporteur réutilisable
const transporter = nodemailer.createTransport({
  service: 'gmail',           // ou 'hotmail', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,  // votre adresse email
    pass: process.env.EMAIL_PASS,  // mot de passe d'application
  },
});

/**
 * Envoie un email.
 * @param {string} to - destinataire
 * @param {string} subject - sujet
 * @param {string} html - contenu HTML
 */
async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: `"Famille & Fraîcheur" <${process.env.EMAIL_USER}>`,
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
 */
async function sendVerificationEmail(to, code) {
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
 */
async function sendPasswordResetEmail(to, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;
  const html = `
    <h2>Réinitialisation de mot de passe</h2>
    <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>Ce lien expire dans 1 heure.</p>
  `;
  return sendEmail({ to, subject: 'Famille & Fraîcheur - Réinitialisation du mot de passe', html });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };