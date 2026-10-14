/*
 * admin-dashboard.js — vue d'ensemble admin : RDV reçus, liste des clients
 * (avec statut et messages non lus), gestion des avis affichés. Toutes les
 * données viennent de Firestore (store.js), partagées entre tous les
 * appareils — y compris ceux des clients qui se sont inscrits ailleurs.
 */
(function () {
  "use strict";

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s == null ? "" : s;
    return div.innerHTML;
  }
  function formatDate(iso) { return new Date(iso).toLocaleDateString("fr-FR"); }

  function renderAppointments(list) {
    var tbody = document.getElementById("rtd-admin-rdv-body");
    var empty = document.getElementById("rtd-admin-rdv-empty");
    var table = document.getElementById("rtd-admin-rdv-table");
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
    Promise.all([
      window.RTD_STORE.countPendingAppointments(),
      window.RTD_STORE.countPendingDocumentsTotal(),
      window.RTD_STORE.countUnreadMessagesTotal()
    ]).then(function (vals) {
      var rdv = vals[0], docs = vals[1], msgs = vals[2];
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
    });
  }

  function renderClients(list) {
    var tbody = document.getElementById("rtd-admin-clients-body");
    var empty = document.getElementById("rtd-admin-clients-empty");
    var table = document.getElementById("rtd-admin-clients-table");
    if (list.length === 0) {
      table.hidden = true; empty.hidden = false;
      return;
    }
    table.hidden = false; empty.hidden = true;
    Promise.all(list.map(function (c) { return window.RTD_STORE.countUnreadMessages(c.id); })).then(function (unreadCounts) {
      tbody.innerHTML = list.map(function (c, i) {
        var unread = unreadCounts[i];
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
    });
  }

  function renderReviews() {
    var wrap = document.getElementById("rtd-admin-reviews");
    window.RTD_STORE.getReviews().then(function (list) {
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
          btn.disabled = true;
          window.RTD_STORE.toggleReviewFeatured(btn.getAttribute("data-toggle-review")).then(renderReviews);
        });
      });
      wrap.querySelectorAll("button[data-remove-review]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (window.confirm("Supprimer définitivement cet avis/témoignage ?")) {
            btn.disabled = true;
            window.RTD_STORE.removeReview(btn.getAttribute("data-remove-review")).then(renderReviews);
          }
        });
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
        window.RTD_STORE.addReview({ type: "texte", auteur: auteur, note: parseInt(textForm.note.value, 10), texte: texte }).then(function () {
          textForm.reset();
          textStatus.textContent = "Avis ajouté et mis en avant sur l'accueil.";
          textStatus.className = "form-status form-status--ok is-visible";
          renderReviews();
        });
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

        window.RTD_STORE.addReview({ type: "video", auteur: auteur }).then(function (review) {
          return window.RTD_FILES.put(review.id, file);
        }).then(function () {
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

  document.addEventListener("DOMContentLoaded", function () {
    renderNotifBanner();
    renderReviews();
    window.RTD_STORE.markAppointmentsSeen().then(renderNotifBanner);

    /* Abonnements en direct : RDV et clients se rafraîchissent tout seuls,
       y compris quand ils arrivent depuis un autre appareil. */
    window.RTD_STORE.watchAppointments(function (list) {
      renderAppointments(list);
      renderNotifBanner();
    });
    window.RTD_STORE.watchClients(renderClients);

    var resetBtn = document.getElementById("rtd-admin-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (window.confirm("Réinitialiser toutes les données de démo (RDV, clients, messages, documents, avis) ? Cette action est irréversible.")) {
          resetBtn.disabled = true;
          window.RTD_STORE.resetDemoData().then(function () {
            resetBtn.disabled = false;
            renderNotifBanner();
            renderReviews();
          });
        }
      });
    }
  });
})();
