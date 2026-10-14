/*
 * admin-client.js — fiche client côté admin : édition du statut de dossier
 * (3 catégories × 3 états), revue des documents déposés, messagerie. Les
 * données du client viennent de Firestore (store.js), partagées entre tous
 * les appareils.
 */
(function () {
  "use strict";

  var ETAPE_LABELS = {
    inpi: { tag: "Étape 1 · INPI", title: "Création de l'entreprise" },
    acre: { tag: "Étape 2 · ACRE / URSSAF", title: "Demande d'exonération ACRE" },
    arce: { tag: "Étape 3 · ARCE", title: "Déblocage des droits ARCE" }
  };
  var STATUT_OPTIONS = [["attente", "Attente"], ["en_cours", "En cours"], ["termine", "Terminé"]];
  var DOC_STATUT_OPTIONS = [["en_attente", "En attente de vérification"], ["valide", "Validé"], ["a_refaire", "À redéposer"]];

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s == null ? "" : s;
    return div.innerHTML;
  }
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " Ko";
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
  }
  function formatDateTime(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString("fr-FR") + " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  function optionsHtml(options, current) {
    return options.map(function (o) {
      return '<option value="' + o[0] + '"' + (o[0] === current ? " selected" : "") + ">" + o[1] + "</option>";
    }).join("");
  }

  function initTabs() {
    var btns = document.querySelectorAll(".tab-btn");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("is-active"); });
        document.querySelectorAll(".tab-panel").forEach(function (p) { p.hidden = true; });
        btn.classList.add("is-active");
        document.getElementById(btn.getAttribute("data-tab")).hidden = false;
      });
    });
  }

  function renderHeader(client) {
    document.getElementById("rtd-c-nom").textContent = client.prenom + " " + client.nom;
    document.getElementById("rtd-c-email").textContent = client.email;
    document.getElementById("rtd-c-tel").textContent = client.telephone;
    document.getElementById("rtd-c-cp").textContent = client.codePostal ? "Code postal " + client.codePostal : "";
    document.getElementById("rtd-c-naissance").textContent = "Né(e) le " + new Date(client.dateNaissance).toLocaleDateString("fr-FR");
    document.getElementById("rtd-c-since").textContent = "Inscrit le " + new Date(client.creeLe).toLocaleDateString("fr-FR");
  }

  function renderDossier(client) {
    var wrap = document.getElementById("rtd-dossier-rows");
    wrap.innerHTML = "";
    ["inpi", "acre", "arce"].forEach(function (cat) {
      var info = ETAPE_LABELS[cat];
      var statut = (client.etapes && client.etapes[cat]) || "attente";
      var row = document.createElement("div");
      row.className = "status-row";
      row.innerHTML =
        '<div class="status-row__label"><span>' + info.tag + '</span><b>' + info.title + "</b></div>" +
        '<select class="status-select" data-cat="' + cat + '">' + optionsHtml(STATUT_OPTIONS, statut) + "</select>";
      wrap.appendChild(row);
    });
    wrap.querySelectorAll(".status-select").forEach(function (sel) {
      sel.addEventListener("change", function () {
        sel.disabled = true;
        window.RTD_STORE.updateClientEtape(client.id, sel.getAttribute("data-cat"), sel.value).then(function () {
          sel.disabled = false;
        });
      });
    });
  }

  function renderDocuments(client) {
    var wrap = document.getElementById("rtd-doc-list");
    window.RTD_STORE.getDocuments(client.id).then(function (docs) {
      if (docs.length === 0) {
        wrap.innerHTML = '<div class="empty-state"><strong>Aucun document déposé</strong>Les fichiers envoyés par le client depuis son espace apparaîtront ici.</div>';
        return;
      }
      wrap.innerHTML = docs.map(function (doc) {
        var typeInfo = window.RTD_STORE.DOCUMENT_TYPES.filter(function (t) { return t.id === doc.type; })[0];
        return '<div class="doc-file-row">' +
          '<span class="doc-file-row__name"><span>' + escapeHtml(typeInfo ? typeInfo.label : doc.type) + " — " + escapeHtml(doc.nomFichier) + " · " + formatSize(doc.tailleOctets) + "</span></span>" +
          '<span class="doc-file-row__actions review-chip-select">' +
            '<button type="button" data-open="' + doc.id + '">Ouvrir</button>' +
            '<select class="status-select" data-doc-status="' + doc.id + '">' + optionsHtml(DOC_STATUT_OPTIONS, doc.statut) + "</select>" +
          "</span></div>";
      }).join("");

      wrap.querySelectorAll("button[data-open]").forEach(function (btn) {
        btn.addEventListener("click", function () { window.RTD_FILES.openInNewTab(btn.getAttribute("data-open")); });
      });
      wrap.querySelectorAll("select[data-doc-status]").forEach(function (sel) {
        sel.addEventListener("change", function () {
          sel.disabled = true;
          window.RTD_STORE.updateDocumentStatus(sel.getAttribute("data-doc-status"), sel.value).then(function () {
            sel.disabled = false;
          });
        });
      });
    });
  }

  function renderMessages(client, msgs) {
    var thread = document.getElementById("rtd-msg-thread");
    if (msgs.length === 0) {
      thread.innerHTML = '<p class="msg-empty">Aucun message pour le moment.</p>';
    } else {
      thread.innerHTML = msgs.map(function (m) {
        return '<div class="msg-bubble msg-bubble--' + (m.auteur === "admin" ? "client" : "admin") + '">' +
          escapeHtml(m.texte) + '<span class="msg-bubble__meta">' + (m.auteur === "admin" ? "Toi" : client.prenom) + " · " + formatDateTime(m.creeLe) + "</span></div>";
      }).join("");
      thread.scrollTop = thread.scrollHeight;
    }
  }

  function initMessaging(client) {
    window.RTD_STORE.markMessagesRead(client.id);
    window.RTD_STORE.watchMessages(client.id, function (msgs) { renderMessages(client, msgs); });
    var form = document.getElementById("rtd-msg-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = form.message.value.trim();
      if (!text) return;
      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      window.RTD_STORE.addMessage(client.id, "admin", text).then(function () {
        form.message.value = "";
        submitBtn.disabled = false;
        if (window.RTD_NOTIFY_CLIENT) window.RTD_NOTIFY_CLIENT(client, text);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      document.getElementById("rtd-client-fiche").hidden = true;
      document.getElementById("rtd-client-not-found").hidden = false;
      return;
    }

    window.RTD_STORE.getClient(id).then(function (client) {
      if (!client) {
        document.getElementById("rtd-client-fiche").hidden = true;
        document.getElementById("rtd-client-not-found").hidden = false;
        return;
      }

      initTabs();
      renderHeader(client);
      renderDossier(client);
      renderDocuments(client);
      initMessaging(client);
    });
  });
})();
