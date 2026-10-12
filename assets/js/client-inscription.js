/*
 * client-inscription.js — création de l'espace client (nom, prénom, email,
 * téléphone, date de naissance, mot de passe). Un compte existant avec la
 * même adresse email redirige vers la connexion plutôt que d'être écrasé.
 */
(function () {
  "use strict";

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validPhone(v) { return /^(0|\+33\s?)[1-9](?:[\s.-]?\d{2}){4}$/.test(v.trim()); }
  function validBirthdate(v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    var d = new Date(v);
    if (isNaN(d.getTime())) return false;
    var age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    return age >= 18 && age <= 100;
  }

  function setError(field, msg) {
    field.classList.toggle("has-error", !!msg);
    var em = field.querySelector(".error-msg");
    if (em) em.textContent = msg || "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.RTD_STORE.getCurrentClient()) {
      window.location.replace("tableau-de-bord.html");
      return;
    }

    var form = document.getElementById("rtd-inscription-form");
    if (!form) return;
    var statusEl = document.getElementById("rtd-inscription-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nom = form.nom.value.trim();
      var prenom = form.prenom.value.trim();
      var email = form.email.value.trim();
      var telephone = form.telephone.value.trim();
      var dateNaissance = form.dateNaissance.value;
      var motDePasse = form.motDePasse.value;
      var motDePasseConfirm = form.motDePasseConfirm.value;
      var consent = form.consentement.checked;

      var ok = true;
      setError(form.prenom.closest(".field"), prenom ? "" : "Indique ton prénom.");
      if (!prenom) ok = false;
      setError(form.nom.closest(".field"), nom ? "" : "Indique ton nom.");
      if (!nom) ok = false;
      setError(form.email.closest(".field"), validEmail(email) ? "" : "Adresse email invalide.");
      if (!validEmail(email)) ok = false;
      setError(form.telephone.closest(".field"), validPhone(telephone) ? "" : "Numéro de téléphone invalide.");
      if (!validPhone(telephone)) ok = false;
      setError(form.dateNaissance.closest(".field"), validBirthdate(dateNaissance) ? "" : "Date de naissance invalide (18 ans ou plus).");
      if (!validBirthdate(dateNaissance)) ok = false;
      setError(form.motDePasse.closest(".field"), motDePasse.length >= 8 ? "" : "8 caractères minimum.");
      if (motDePasse.length < 8) ok = false;
      setError(form.motDePasseConfirm.closest(".field"), motDePasse === motDePasseConfirm ? "" : "Les mots de passe ne correspondent pas.");
      if (motDePasse !== motDePasseConfirm) ok = false;

      statusEl.className = "form-status";
      if (!consent) {
        ok = false;
        statusEl.textContent = "Merci de cocher la case de consentement pour continuer.";
        statusEl.className = "form-status form-status--err is-visible";
      }
      if (!ok) return;

      if (window.RTD_STORE.findClientByEmail(email)) {
        statusEl.textContent = "Un espace client existe déjà avec cette adresse email. Connecte-toi plutôt.";
        statusEl.className = "form-status form-status--err is-visible";
        return;
      }

      submitBtn.disabled = true;
      window.RTD_STORE.addClient({
        nom: nom, prenom: prenom, email: email, telephone: telephone,
        dateNaissance: dateNaissance, motDePasse: motDePasse
      }).then(function () {
        window.location.href = "tableau-de-bord.html";
      });
    });
  });
})();
