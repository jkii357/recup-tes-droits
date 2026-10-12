/*
 * reviews.js — rendu des avis et témoignages vidéo sur la page d'accueil,
 * à partir de ce que l'admin a ajouté/mis en avant (voir espace-admin).
 * Les vraies vidéos déposées par l'admin (RTD_FILES) sont lues directement ;
 * les avis/témoignages d'exemple restent étiquetés comme tels.
 */
(function () {
  "use strict";

  function starRow(note) {
    var out = "";
    for (var i = 0; i < 5; i++) out += i < note ? "★" : "☆";
    return out;
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
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
          (r.exemple ? '<span class="chip chip--exemple">Avis exemple</span>' : "") +
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

      if (!r.exemple && window.RTD_FILES) {
        card.innerHTML =
          '<div class="rtd-video-card__poster" aria-hidden="true"><span class="rtd-video-card__play">▶</span></div>' +
          '<p class="rtd-video-card__author">' + escapeHtml(r.auteur) + "</p>";
        window.RTD_FILES.get(r.id).then(function (blob) {
          if (!blob) return;
          var url = URL.createObjectURL(blob);
          var video = document.createElement("video");
          video.className = "rtd-video-card__video";
          video.controls = true;
          video.preload = "metadata";
          video.src = url;
          var poster = card.querySelector(".rtd-video-card__poster");
          if (poster) poster.replaceWith(video);
        });
      } else {
        card.innerHTML =
          '<div class="rtd-video-card__poster" aria-hidden="true"><span class="rtd-video-card__play">▶</span></div>' +
          '<p class="rtd-video-card__caption">Exemple — vidéo à venir</p>' +
          '<p class="rtd-video-card__author">' + escapeHtml(r.auteur) + "</p>";
      }
      container.appendChild(card);
    });
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
