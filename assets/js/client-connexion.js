/*
 * client-connexion.js — connexion à l'espace client existant (email + mot
 * de passe).
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    if (window.RTD_STORE.getCurrentClient()) {
      window.location.replace("/espace-client/tableau-de-bord.html");
      return;
    }

    var form = document.getElementById("rtd-connexion-form");
    if (!form) return;
    var statusEl = document.getElementById("rtd-connexion-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      var motDePasse = form.motDePasse.value;

      statusEl.className = "form-status";
      submitBtn.disabled = true;

      window.RTD_STORE.authenticateClient(email, motDePasse).then(function (client) {
        if (client) {
          window.location.href = "/espace-client/tableau-de-bord.html";
          return;
        }
        submitBtn.disabled = false;
        statusEl.textContent = "Email ou mot de passe incorrect.";
        statusEl.className = "form-status form-status--err is-visible";
        form.motDePasse.value = "";
        form.motDePasse.focus();
      });
    });
  });
})();
