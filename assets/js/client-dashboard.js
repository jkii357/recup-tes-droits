/*
 * client-dashboard.js — espace client : dossier (lecture seule), documents
 * (dépôt), messagerie. Toutes les données viennent de store.js / files-db.js.
 */
(function () {
  "use strict";

  var ETAPE_LABELS = {
    inpi: { tag: "Étape 1 · INPI", title: "Création de ton entreprise" },
    acre: { tag: "Étape 2 · ACRE / URSSAF", title: "Demande d'exonération ACRE" },
    arce: { tag: "Étape 3 · ARCE", title: "Déblocage de tes droits ARCE" }
  };
  var STATUT_LABELS = { attente: "Attente", en_cours: "En cours", termine: "Terminé" };
  var DOC_STATUT_LABELS = { en_attente: "En attente de vérification", valide: "Validé", a_refaire: "À redéposer" };

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
        '<span class="chip chip--' + statut + '">' + STATUT_LABELS[statut] + "</span>";
      wrap.appendChild(row);
    });
  }

  function renderDocuments(client) {
    var wrap = document.getElementById("rtd-doc-types");
    wrap.innerHTML = "";
    window.RTD_STORE.DOCUMENT_TYPES.forEach(function (docType) {
      var docs = window.RTD_STORE.getDocuments(client.id).filter(function (d) { return d.type === docType.id; });

      var block = document.createElement("div");
      block.className = "doc-type";

      var head = document.createElement("div");
      head.className = "doc-type__head";
      head.innerHTML =
        "<b>" + escapeHtml(docType.label) + "</b>" +
        '<label class="file-input-label">Déposer un fichier<input type="file" data-doc-type="' + docType.id + '" accept="image/*,.pdf"></label>';
      block.appendChild(head);

      if (docType.hint) {
        var hint = document.createElement("p");
        hint.className = "doc-type__hint";
        hint.textContent = docType.hint;
        block.appendChild(hint);
      }

      var list = document.createElement("div");
      list.className = "doc-file-list";
      if (docs.length === 0) {
        list.innerHTML = '<p class="msg-empty" style="padding:0.5em 0;">Aucun fichier déposé pour le moment.</p>';
      } else {
        docs.forEach(function (doc) {
          var row = document.createElement("div");
          row.className = "doc-file-row";
          row.innerHTML =
            '<span class="doc-file-row__name"><span>' + escapeHtml(doc.nomFichier) + " · " + formatSize(doc.tailleOctets) + "</span></span>" +
            '<span class="doc-file-row__actions">' +
              '<span class="chip chip--' + (doc.statut === "valide" ? "termine" : doc.statut === "a_refaire" ? "attente" : "en_cours") + '">' + DOC_STATUT_LABELS[doc.statut] + "</span>" +
              '<button type="button" data-open="' + doc.id + '">Ouvrir</button>' +
              '<button type="button" data-remove="' + doc.id + '">Supprimer</button>' +
            "</span>";
          list.appendChild(row);
        });
      }
      block.appendChild(list);

      var notice = document.createElement("p");
      notice.className = "doc-demo-notice";
      notice.textContent = "Démo — ne dépose pas de vrai document d'identité ici tant que ce n'est pas la version en production.";
      block.appendChild(notice);

      wrap.appendChild(block);
    });

    wrap.querySelectorAll('input[type="file"]').forEach(function (input) {
      input.addEventListener("change", function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var meta = window.RTD_STORE.addDocumentMeta(client.id, input.getAttribute("data-doc-type"), file);
        window.RTD_FILES.put(meta.id, file).then(function () {
          renderDocuments(client);
        });
      });
    });
    wrap.querySelectorAll("button[data-open]").forEach(function (btn) {
      btn.addEventListener("click", function () { window.RTD_FILES.openInNewTab(btn.getAttribute("data-open")); });
    });
    wrap.querySelectorAll("button[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-remove");
        window.RTD_STORE.removeDocument(id);
        window.RTD_FILES.remove(id);
        renderDocuments(client);
      });
    });
  }

  function renderMessages(client) {
    var thread = document.getElementById("rtd-msg-thread");
    var msgs = window.RTD_STORE.getMessages(client.id);
    thread.innerHTML = "";
    if (msgs.length === 0) {
      thread.innerHTML = '<p class="msg-empty">Pose ta première question, je te réponds au plus vite.</p>';
    } else {
      msgs.forEach(function (m) {
        var bubble = document.createElement("div");
        bubble.className = "msg-bubble msg-bubble--" + (m.auteur === "admin" ? "admin" : "client");
        bubble.innerHTML = escapeHtml(m.texte) + '<span class="msg-bubble__meta">' + (m.auteur === "admin" ? "Récup tes Droits" : "Toi") + " · " + formatDateTime(m.creeLe) + "</span>";
        thread.appendChild(bubble);
      });
      thread.scrollTop = thread.scrollHeight;
    }
  }

  function initMessaging(client) {
    renderMessages(client);
    var form = document.getElementById("rtd-msg-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = form.message.value.trim();
      if (!text) return;
      window.RTD_STORE.addMessage(client.id, "client", text);
      form.message.value = "";
      renderMessages(client);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var client = window.RTD_STORE.getCurrentClient();
    if (!client) {
      window.location.replace("connexion.html");
      return;
    }
    document.getElementById("rtd-client-prenom").textContent = client.prenom;
    document.getElementById("rtd-client-since").textContent = "Dossier ouvert le " + new Date(client.creeLe).toLocaleDateString("fr-FR");

    initTabs();
    renderDossier(client);
    renderDocuments(client);
    initMessaging(client);
  });
})();
