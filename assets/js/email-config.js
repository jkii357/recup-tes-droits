/*
 * email-config.js — réglages pour l'envoi d'un email au client quand
 * l'admin lui répond dans la messagerie. Utilise EmailJS (gratuit, pas de
 * serveur à gérer). Voir EMAIL-SETUP.md pour la marche à suivre complète.
 *
 * Tant que enabled vaut false, aucun email n'est envoyé (le message reste
 * quand même visible dans l'espace client, comme avant).
 */
window.RTD_EMAIL_CONFIG = {
  enabled: false,
  publicKey: "À_REMPLACER",
  serviceId: "À_REMPLACER",
  templateId: "À_REMPLACER"
};
