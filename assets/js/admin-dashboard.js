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
      return "<tr" + (a.vu ? "" : ' style="font-weight:700;"') + "><td>" + escapeHtml(a.date) + " · " + escapeHtml(a.heure) + (a.vu ? "" : ' <span class="chip chip--en_cours">Nouveau</span>') + "</td>" +
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
    if (list.length === 0) {
      wrap.innerHTML = '<p class="msg-empty">Aucun avis pour le moment.</p>';
      return;
    }
    wrap.innerHTML = list.map(function (r) {
      var apercu = r.texte ? " — " + escapeHtml(r.texte.slice(0, 60)) + (r.texte.length > 60 ? "…" : "") : "";
      return '<div class="doc-file-row">' +
        '<span class="doc-file-row__name"><span class="chip" style="background:var(--paper-dim); color:var(--ink-soft);">' + (r.type === "video" ? "Vidéo" : "Texte") + '</span> <span>' + escapeHtml(r.auteur) + apercu + "</span></span>" +
        '<span class="doc-file-row__actions">' +
          (r.exemple ? '<span class="chip chip--exemple">Exemple</span>' : "") +
          '<button type="button" class="btn btn--ghost btn--sm" data-toggle-review="' + r.id + '">' + (r.enAvant ? "Retirer de l'accueil" : "Mettre en avant") + "</button>" +
          '<button type="button" data-remove-review="' + r.id + '">Supprimer</button>' +
        "</span></div>";
    }).join("");
    wrap.querySelectorAll("button[data-toggle-review]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.RTD_STORE.toggleReviewFeatured(btn.getAttribute("data-toggle-review"));
        renderReviews();
      });
    });
    wrap.querySelectorAll("button[data-remove-review]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.confirm("Supprimer définitivement cet avis/témoignage ?")) {
          window.RTD_STORE.removeReview(btn.getAttribute("data-remove-review"));
          renderReviews();
        }
      });
    });
  }

  function initReviewForms() {
    var textForm = document.getElementById("rtd-review-text-form");
    var textStatus = document.getElementById("rtd-review-text-status");
    if (textForm) {
      textForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var auteur = textForm.auteur.value.trim();
        var texte = textForm.texte.value.trim();
        if (!auteur || !texte) return;
        window.RTD_STORE.addReview({ type: "texte", auteur: auteur, note: parseInt(textForm.note.value, 10), texte: texte });
        textForm.reset();
        textStatus.textContent = "Avis ajouté et mis en avant sur l'accueil.";
        textStatus.className = "form-status form-status--ok is-visible";
        renderReviews();
      });
    }

    var videoForm = document.getElementById("rtd-review-video-form");
    var videoStatus = document.getElementById("rtd-review-video-status");
    var videoFileInput = videoForm ? videoForm.querySelector('input[type="file"]') : null;
    var videoFilenameEl = document.getElementById("rtd-review-video-filename");
    if (videoFileInput) {
      videoFileInput.addEventListener("change", function () {
        var f = videoFileInput.files && videoFileInput.files[0];
        videoFilenameEl.textContent = f ? f.name : "Aucun fichier choisi";
      });
    }
    if (videoForm) {
      videoForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var auteur = videoForm.auteur.value.trim();
        var file = videoFileInput.files && videoFileInput.files[0];
        if (!auteur || !file) return;
        var submitBtn = videoForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        videoStatus.textContent = "Envoi en cours...";
        videoStatus.className = "form-status is-visible";

        var review = window.RTD_STORE.addReview({ type: "video", auteur: auteur });
        window.RTD_FILES.put(review.id, file).then(function () {
          submitBtn.disabled = false;
          videoForm.reset();
          videoFilenameEl.textContent = "Aucun fichier choisi";
          videoStatus.textContent = "Vidéo ajoutée et mise en avant sur l'accueil.";
          videoStatus.className = "form-status form-status--ok is-visible";
          renderReviews();
        });
      });
    }
  }

  function renderAll() {
    renderNotifBanner();
    renderAppointments();
    renderClients();
    renderReviews();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderAll();
    initReviewForms();
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
