/*
 * admin-dashboard.js — vue d'ensemble admin : RDV reçus, liste des clients
 * (avec statut et messages non lus), gestion des avis affichés.
 */
(function () {
  "use strict";

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s == null ? "" : s;
    return div.innerHTML;
  }
  function formatDate(iso) { return new Date(iso).toLocaleDateString("fr-FR"); }
  var STATUT_LABELS = { attente: "Attente", en_cours: "En cours", termine: "Terminé" };

  function renderAppointments() {
    var tbody = document.getElementById("rtd-admin-rdv-body");
    var empty = document.getElementById("rtd-admin-rdv-empty");
    var table = document.getElementById("rtd-admin-rdv-table");
    var list = window.RTD_STORE.getAppointments();
    if (list.length === 0) {
      table.hidden = true; empty.hidden = false;
      return;
    }
    table.hidden = false; empty.hidden = true;
    tbody.innerHTML = list.map(function (a) {
      return "<tr" + (a.vu ? "" : ' style="font-weight:700;"') + "><td>" + escapeHtml(a.date) + (a.vu ? "" : ' <span class="chip chip--en_cours">Nouveau</span>') + "</td>" +
        "<td>" + escapeHtml(a.prenom) + " " + escapeHtml(a.nom) + "</td>" +
        "<td>" + escapeHtml(a.email) + "</td>" +
        "<td>" + escapeHtml(a.telephone) + "</td>" +
        "<td>" + formatDate(a.creeLe) + "</td></tr>";
    }).join("");
  }

  function renderNotifBanner() {
    var el = document.getElementById("rtd-admin-notif");
    if (!el) return;
    var rdv = window.RTD_STORE.countPendingAppointments();
    var docs = window.RTD_STORE.countPendingDocumentsTotal();
    var msgs = window.RTD_STORE.countUnreadMessagesTotal();
    var total = rdv + docs + msgs;
    if (total === 0) { el.hidden = true; return; }
    var parts = [];
    if (rdv) parts.push(rdv + (rdv > 1 ? " nouveaux RDV" : " nouveau RDV"));
    if (docs) parts.push(docs + (docs > 1 ? " documents à vérifier" : " document à vérifier"));
    if (msgs) parts.push(msgs + (msgs > 1 ? " messages non lus" : " message non lu"));
    el.hidden = false;
    el.innerHTML =
      '<span class="notice__kicker">Nouveautés</span>' +
      "<p>" + parts.join(" · ") + ".</p>";
  }

  function renderClients() {
    var tbody = document.getElementById("rtd-admin-clients-body");
    var empty = document.getElementById("rtd-admin-clients-empty");
    var table = document.getElementById("rtd-admin-clients-table");
    var list = window.RTD_STORE.getClients();
    if (list.length === 0) {
      table.hidden = true; empty.hidden = false;
      return;
    }
    table.hidden = false; empty.hidden = true;
    tbody.innerHTML = list.map(function (c) {
      var unread = window.RTD_STORE.countUnreadMessages(c.id);
      var etapes = c.etapes || { inpi: "attente", acre: "attente", arce: "attente" };
      var chips = ["inpi", "acre", "arce"].map(function (cat) {
        return '<span class="chip chip--' + etapes[cat] + '" title="' + cat.toUpperCase() + '">' + cat.toUpperCase() + "</span>";
      }).join(" ");
      return "<tr><td><a class=\"client-link\" href=\"client.html?id=" + encodeURIComponent(c.id) + "\">" +
        escapeHtml(c.prenom) + " " + escapeHtml(c.nom) +
        (unread ? '<span class="unread-badge">' + unread + "</span>" : "") +
        "</a></td>" +
        "<td>" + escapeHtml(c.email) + "</td>" +
        "<td>" + formatDate(c.creeLe) + "</td>" +
        "<td>" + chips + "</td></tr>";
    }).join("");
  }

  function renderReviews() {
    var wrap = document.getElementById("rtd-admin-reviews");
    var list = window.RTD_STORE.getReviews();
    wrap.innerHTML = list.map(function (r) {
      return '<div class="doc-file-row">' +
        '<span class="doc-file-row__name"><span class="chip" style="background:var(--paper-dim); color:var(--ink-soft);">' + (r.type === "video" ? "Vidéo" : "Texte") + '</span> <span>' + escapeHtml(r.auteur) + " — " + escapeHtml(r.texte.slice(0, 60)) + (r.texte.length > 60 ? "…" : "") + "</span></span>" +
        '<span class="doc-file-row__actions">' +
          '<span class="chip chip--exemple">Exemple</span>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-toggle-review="' + r.id + '">' + (r.enAvant ? "Retirer de l'accueil" : "Mettre en avant") + "</button>" +
        "</span></div>";
    }).join("");
    wrap.querySelectorAll("button[data-toggle-review]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.RTD_STORE.toggleReviewFeatured(btn.getAttribute("data-toggle-review"));
        renderReviews();
      });
    });
  }

  function renderAll() {
    renderNotifBanner();
    renderAppointments();
    renderClients();
    renderReviews();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderAll();
    window.RTD_STORE.markAppointmentsSeen();

    var resetBtn = document.getElementById("rtd-admin-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (window.confirm("Réinitialiser toutes les données de démo (RDV, clients, messages, documents, avis) ? Cette action est irréversible.")) {
          window.RTD_STORE.resetDemoData();
          renderAll();
        }
      });
    }

    window.addEventListener("storage", function (e) {
      if (e.key && e.key.indexOf("rtd_") === 0) renderAll();
    });
  });
})();
