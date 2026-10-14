/*
 * client-connexion.js — connexion à l'espace client existant (email + mot
 * de passe).
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    window.RTD_STORE.getCurrentClient().then(function (client) {
      if (client) window.location.replace("tableau-de-bord.html");
    });

    var form = document.getElementById("rtd-connexion-form");
    if (!form) return;
    var statusEl = document.getElementById("rtd-connexion-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      var motDePasse = form.motDePasse.value;
      var remember = form.seSouvenir.checked;

      statusEl.className = "form-status";
      submitBtn.disabled = true;

      window.RTD_STORE.authenticateClient(email, motDePasse, remember).then(function (client) {
        if (client) {
          window.location.href = "tableau-de-bord.html";
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
