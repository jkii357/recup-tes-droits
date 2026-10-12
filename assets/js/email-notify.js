/*
 * email-notify.js — envoie un email au client quand l'admin répond à son
 * message, via EmailJS. Ne fait rien tant que email-config.js n'est pas
 * renseigné (voir EMAIL-SETUP.md).
 */
(function () {
  "use strict";

  var initialized = false;

  function notifyClientOfReply(client, messageText) {
    var cfg = window.RTD_EMAIL_CONFIG;
    if (!cfg || !cfg.enabled || typeof window.emailjs === "undefined") return;

    if (!initialized) {
      window.emailjs.init({ publicKey: cfg.publicKey });
      initialized = true;
    }

    window.emailjs.send(cfg.serviceId, cfg.templateId, {
      to_email: client.email,
      to_name: client.prenom,
      message: messageText
    }).catch(function (err) {
      console.error("Envoi de l'email de notification échoué :", err);
    });
  }

  window.RTD_NOTIFY_CLIENT = notifyClientOfReply;
})();
