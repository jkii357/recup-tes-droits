/*
 * chrome.js — injecte la bannière maquette, le header et le footer sur
 * chaque page. Un seul fichier à maintenir pour ces trois blocs.
 *
 * Tous les liens sont relatifs (jamais "/assets/...") pour fonctionner à
 * la fois en local et sur un hébergement en sous-dossier comme GitHub
 * Pages (ex. jkii357.github.io/recup-tes-droits/). Chaque page indique sa
 * profondeur via <body data-base="">  (racine) ou data-base="../"
 * (espace-client/, espace-admin/).
 *
 * Chaque page indique aussi son contexte via <body data-page="...">:
 *   home | legal | client-auth | client-app | admin-auth | admin-app
 */
(function () {
  "use strict";

  var PAGE = document.body.getAttribute("data-page") || "home";
  var BASE = document.body.getAttribute("data-base") || "";
  var IS_APP = PAGE === "client-app" || PAGE === "admin-app" || PAGE === "client-auth" || PAGE === "admin-auth";
  var SHOW_FOOTER = !IS_APP;

  var MARK_IMG = '<img class="brand__mark" src="' + BASE + 'assets/img/logo/logo-recup-tes-droits.jpg" alt="Récup tes Droits" width="40" height="40">';

  function renderBanner(container) {
    var el = document.createElement("div");
    el.className = "rtd-mockup-banner";
    el.setAttribute("role", "note");
    el.innerHTML =
      '<strong>Maquette de démonstration</strong>' +
      '<span class="rtd-banner-sep">—</span>' +
      "réalisée pour Récup tes Droits, non destinée à la mise en ligne telle quelle. " +
      "Contenus et données d'exemple.";
    container.appendChild(el);
    return el;
  }

  function renderHeader(container) {
    var header = document.createElement("header");
    header.className = "site-header" + (IS_APP ? " site-header--app" : "");

    var brandLabel = PAGE === "admin-app" || PAGE === "admin-auth" ? "Espace admin" : (PAGE === "client-app" || PAGE === "client-auth" ? "Espace client" : "");

    var inner = document.createElement("div");
    inner.className = "wrap site-header__inner";

    var brand = document.createElement("a");
    brand.className = "brand";
    brand.href = BASE + "index.html";
    brand.innerHTML = MARK_IMG +
      '<span class="brand__text"><b>Récup tes Droits</b>' +
      (brandLabel ? "<small>" + brandLabel + "</small>" : "<small>Création d'entreprise &amp; droits ARCE</small>") +
      "</span>";
    inner.appendChild(brand);

    if (!IS_APP) {
      var nav = document.createElement("nav");
      nav.className = "site-nav";
      nav.setAttribute("aria-label", "Navigation principale");
      nav.innerHTML =
        '<a href="' + BASE + 'index.html#service">Le service</a>' +
        '<a href="' + BASE + 'index.html#avis">Avis</a>' +
        '<a href="' + BASE + 'index.html#faq">FAQ</a>';
      inner.appendChild(nav);
    }

    var actions = document.createElement("div");
    actions.className = "site-header__actions";
    if (PAGE === "admin-app" || PAGE === "client-app") {
      var exitHref = PAGE === "admin-app" ? "connexion.html" : "connexion.html";
      actions.innerHTML += '<a class="app-exit" id="rtd-exit-link" href="' + exitHref + '">Se déconnecter</a>';
      if (PAGE === "admin-app" && window.RTD_STORE) {
        window.RTD_STORE.getAdminNotificationCount().then(function (notifCount) {
          if (notifCount > 0) {
            actions.insertAdjacentHTML("afterbegin", '<a class="app-exit" href="tableau-de-bord.html">Nouveautés<span class="unread-badge">' + notifCount + "</span></a>");
          }
        });
      }
    } else if (PAGE === "admin-auth" || PAGE === "client-auth") {
      actions.innerHTML = '<a class="app-exit" href="' + BASE + 'index.html">Retour au site</a>';
    } else {
      actions.innerHTML =
        '<a class="btn btn--ghost btn--sm" href="' + BASE + 'espace-client/connexion.html">Connexion</a>' +
        '<a class="btn btn--stamp btn--sm" href="' + BASE + 'espace-client/inscription.html">S\'inscrire</a>';
    }
    inner.appendChild(actions);

    if (PAGE === "admin-app" || PAGE === "client-app") {
      var exitLink = actions.querySelector("#rtd-exit-link");
      if (exitLink) {
        exitLink.addEventListener("click", function (e) {
          e.preventDefault();
          if (PAGE === "admin-app") {
            try { sessionStorage.removeItem("rtd_admin_session"); } catch (err) {}
          } else if (window.RTD_STORE) {
            window.RTD_STORE.clearCurrentClient();
          }
          window.location.href = exitHref;
        });
      }
    }

    header.appendChild(inner);
    container.appendChild(header);
  }

  function renderFooter() {
    if (!SHOW_FOOTER) return;
    var footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML =
      '<div class="wrap">' +
        '<div class="footer__grid">' +
          '<div class="footer__brand">' +
            '<a class="brand" href="' + BASE + 'index.html">' + MARK_IMG +
              '<span class="brand__text"><b>Récup tes Droits</b><small>Création d\'entreprise &amp; droits ARCE</small></span>' +
            "</a>" +
            '<p class="footer__tagline">Ton argent dort, réveille-le. Accompagnement complet de la création d\'entreprise au déblocage de l\'ARCE, partout en France.</p>' +
          "</div>" +
          '<div>' +
            "<h5>Le service</h5>" +
            '<ul>' +
              '<li><a href="' + BASE + 'index.html#service">Comment ça marche</a></li>' +
              '<li><a href="' + BASE + 'index.html#avis">Avis clients</a></li>' +
              '<li><a href="' + BASE + 'index.html#faq">Questions fréquentes</a></li>' +
              '<li><a href="' + BASE + 'espace-client/inscription.html">Créer mon espace client</a></li>' +
              '<li><a href="' + BASE + 'espace-client/connexion.html">Connexion client</a></li>' +
            "</ul>" +
          "</div>" +
          '<div>' +
            "<h5>Contact</h5>" +
            '<ul>' +
              '<li class="placeholder">[Téléphone à renseigner]</li>' +
              '<li class="placeholder">[Email à renseigner]</li>' +
              '<li>Intervention partout en France, à distance</li>' +
            "</ul>" +
          "</div>" +
        "</div>" +
        '<div class="footer__bottom">' +
          '<p>&copy; <span id="rtd-year"></span> Récup tes Droits — Auto-entrepreneur. Maquette de démonstration.</p>' +
          '<div style="display:flex; gap:1.25rem; flex-wrap:wrap;">' +
            '<a href="' + BASE + 'mentions-legales.html">Mentions légales</a>' +
            '<a href="' + BASE + 'politique-de-confidentialite.html">Confidentialité</a>' +
            '<a href="' + BASE + 'cgu.html">CGU</a>' +
          "</div>" +
          '<div class="footer__social">' +
            '<a href="https://www.instagram.com/recuptesdroits/" target="_blank" rel="noopener">Instagram</a>' +
            '<a href="https://www.tiktok.com/@recuptesdroits" target="_blank" rel="noopener">TikTok</a>' +
          "</div>" +
        "</div>" +
      "</div>";
    document.body.appendChild(footer);
    var y = document.getElementById("rtd-year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  var chromeTop = document.createElement("div");
  chromeTop.className = "rtd-chrome-top";
  renderBanner(chromeTop);
  renderHeader(chromeTop);
  document.body.insertAdjacentElement("afterbegin", chromeTop);

  document.addEventListener("DOMContentLoaded", function () {
    renderFooter();
  });
})();
