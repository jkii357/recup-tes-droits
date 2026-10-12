/*
 * reviews.js — rendu des avis et témoignages vidéo sur la page d'accueil,
 * à partir de ce que l'admin a mis en avant (voir espace-admin).
 */
(function () {
  "use strict";

  function starRow(note) {
    var out = "";
    for (var i = 0; i < 5; i++) out += i < note ? "★" : "☆";
    return out;
  }

  function renderTextReviews(container, reviews) {
    container.innerHTML = "";
    if (reviews.length === 0) {
      container.innerHTML = '<p class="rtd-empty">Aucun avis mis en avant pour le moment.</p>';
      return;
    }
    reviews.forEach(function (r) {
      var card = document.createElement("article");
      card.className = "rtd-review-card";
      card.innerHTML =
        '<div class="rtd-review-card__top">' +
          '<span class="rtd-stars" aria-hidden="true">' + starRow(r.note) + "</span>" +
          '<span class="chip chip--exemple">Avis exemple</span>' +
        "</div>" +
        '<p class="rtd-review-card__text">' + escapeHtml(r.texte) + "</p>" +
        '<p class="rtd-review-card__author">' + escapeHtml(r.auteur) + "</p>";
      container.appendChild(card);
    });
  }

  function renderVideoReviews(container, reviews) {
    container.innerHTML = "";
    reviews.forEach(function (r) {
      var card = document.createElement("article");
      card.className = "rtd-video-card";
      card.innerHTML =
        '<div class="rtd-video-card__poster" aria-hidden="true">' +
          '<span class="rtd-video-card__play">▶</span>' +
        "</div>" +
        '<p class="rtd-video-card__caption">Exemple — vidéo à venir</p>' +
        '<p class="rtd-video-card__author">' + escapeHtml(r.auteur) + "</p>";
      container.appendChild(card);
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function init() {
    var textWrap = document.getElementById("rtd-reviews-text");
    var videoWrap = document.getElementById("rtd-reviews-video");
    if (!textWrap && !videoWrap) return;

    var featured = window.RTD_STORE.getReviews({ onlyFeatured: true });
    if (textWrap) renderTextReviews(textWrap, featured.filter(function (r) { return r.type === "texte"; }));
    if (videoWrap) renderVideoReviews(videoWrap, featured.filter(function (r) { return r.type === "video"; }));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
