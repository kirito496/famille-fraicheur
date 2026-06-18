// services/email.js — Envoi d'emails via l'API HTTP de Brevo
// (contourne le blocage SMTP de Railway : tout passe en HTTPS sur le port 443)
//
// Variables à définir dans Railway :
//   BREVO_API_KEY  = ta clé API Brevo
//   BREVO_SENDER   = ton adresse d'expéditeur VÉRIFIÉE dans Brevo
//   FRONTEND_URL   = https://famille-fraicheur-production.up.railway.app

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER || process.env.EMAIL_USER;
const SENDER_NAME = 'Famille & Fraîcheur';

const emailConfigured = Boolean(BREVO_API_KEY && SENDER_EMAIL);

if (!emailConfigured) {
  console.warn(
    "\u26A0\uFE0F  Brevo non configure (BREVO_API_KEY / BREVO_SENDER manquants). " +
    "Les codes et liens seront affiches dans les logs au lieu d'etre envoyes."
  );
}

// Envoie un email via l'API Brevo. Si non configure, on n'envoie rien (sans planter).
async function sendEmail({ to, subject, html }) {
  if (!emailConfigured) {
    console.log(`\uD83D\uDCED [EMAIL NON CONFIGURE] Destinataire : ${to} — Sujet : "${subject}"`);
    return { skipped: true };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo a refuse l'envoi (${response.status}) : ${detail}`);
  }

  console.log(`\uD83D\uDCE7 Email envoye a ${to} via Brevo.`);
  return response.json().catch(() => ({}));
}

// Email de verification avec le code a 6 chiffres.
async function sendVerificationEmail(to, code) {
  if (!emailConfigured) {
    console.log(`\uD83D\uDD10 [CODE DE VERIFICATION] ${to} -> ${code}`);
  }
  const html = `
    <h2>Verification de votre compte</h2>
    <p>Voici votre code de verification :</p>
    <h1 style="color:#166534;letter-spacing:4px;">${code}</h1>
    <p>Ce code expire dans 1 heure.</p>
    <p>&mdash; Famille &amp; Fraicheur</p>
  `;
  return sendEmail({ to, subject: 'Famille & Fraicheur — Code de verification', html });
}

// Email de reinitialisation de mot de passe (lien).
async function sendPasswordResetEmail(to, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;
  if (!emailConfigured) {
    console.log(`\uD83D\uDD11 [LIEN DE REINITIALISATION] ${to} -> ${resetUrl}`);
  }
  const html = `
    <h2>Reinitialisation de mot de passe</h2>
    <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Ce lien expire dans 1 heure.</p>
    <p>&mdash; Famille &amp; Fraicheur</p>
  `;
  return sendEmail({ to, subject: 'Famille & Fraicheur — Reinitialisation du mot de passe', html });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };