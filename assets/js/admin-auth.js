/*
 * admin-auth.js — accès à l'espace admin.
 *
 * DÉMO — PAS UNE SÉCURITÉ RÉELLE. Le code d'accès est une constante en
 * clair dans ce fichier JavaScript : n'importe qui ouvrant les outils de
 * développement peut le lire. Cela n'existe que pour protéger la démo
 * pendant une présentation commerciale. Une vraie authentification
 * côté serveur est un prérequis avant toute mise en production.
 *
 * Le code n'est volontairement pas affiché sur l'écran de connexion pour
 * garder une démo crédible — il est documenté dans le README du projet.
 */
(function () {
  "use strict";

  var RTD_DEMO_ADMIN_CODE = "RTD2026";
  var SESSION_KEY = "rtd_admin_session";
  var PAGE = document.body.getAttribute("data-page");

  function isAuthenticated() {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) { return false; }
  }

  // Garde immédiate sur les pages protégées, avant tout rendu de données.
  if (PAGE === "admin-app" && !isAuthenticated()) {
    window.location.replace("/espace-admin/connexion.html");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("rtd-admin-login-form");
    if (!form) return;

    if (isAuthenticated()) {
      window.location.replace("/espace-admin/tableau-de-bord.html");
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var code = form.code.value.trim();
      var statusEl = document.getElementById("rtd-admin-login-status");
      if (code === RTD_DEMO_ADMIN_CODE) {
        try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (err) {}
        window.location.href = "/espace-admin/tableau-de-bord.html";
      } else {
        statusEl.textContent = "Code d'accès incorrect.";
        statusEl.className = "form-status form-status--err is-visible";
        form.code.value = "";
        form.code.focus();
      }
    });
  });
})();
