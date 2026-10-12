/*
 * booking.js — widget de prise de RDV (page d'accueil). Démo : pas de vrai
 * Calendly connecté. Les dates proposées partent toujours d'aujourd'hui et
 * excluent automatiquement les jours déjà réservés par quelqu'un d'autre.
 */
(function () {
  "use strict";

  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var NB_DATES = 6;

  function formatDateLabel(d) {
    return JOURS[d.getDay()] + " " + d.getDate() + " " + MOIS[d.getMonth()];
  }
  function formatDateIso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function formatTodayLabel() {
    var d = new Date();
    return JOURS[d.getDay()] + " " + d.getDate() + " " + MOIS[d.getMonth()] + " " + d.getFullYear();
  }

  /** Prochains jours ouvrés disponibles (ni samedi/dimanche, ni déjà réservés). */
  function nextAvailableDates(count) {
    var booked = window.RTD_STORE.getBookedDates();
    var out = [];
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    var guard = 0;
    while (out.length < count && guard < 120) {
      guard++;
      var day = d.getDay();
      var iso = formatDateIso(d);
      if (day !== 0 && day !== 6 && booked.indexOf(iso) === -1) {
        out.push(new Date(d.getTime()));
      }
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validPhone(v) { return /^(0|\+33\s?)[1-9](?:[\s.-]?\d{2}){4}$/.test(v.trim()); }

  function setError(field, msg) {
    field.classList.toggle("has-error", !!msg);
    var em = field.querySelector(".error-msg");
    if (em) em.textContent = msg || "";
  }

  function init() {
    var root = document.getElementById("rtd-booking");
    if (!root) return;

    var selectedDate = null;
    var dateList = root.querySelector("#rtd-booking-dates");
    var todayEl = root.querySelector("#rtd-booking-today");
    var formStep = root.querySelector("#rtd-booking-form-step");
    var confirmStep = root.querySelector("#rtd-booking-confirm");
    var form = root.querySelector("#rtd-booking-form");
    var recapEl = root.querySelector("#rtd-booking-recap");
    var statusEl = root.querySelector("#rtd-booking-status");

    if (todayEl) todayEl.textContent = "Aujourd'hui, " + formatTodayLabel();

    function renderDates() {
      var dates = nextAvailableDates(NB_DATES);
      dateList.innerHTML = "";
      dates.forEach(function (d, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "rtd-slot-chip";
        btn.textContent = formatDateLabel(d);
        btn.setAttribute("data-iso", formatDateIso(d));
        if (i === 0) { btn.classList.add("is-selected"); selectedDate = d; formStep.hidden = false; }
        btn.addEventListener("click", function () {
          selectedDate = d;
          Array.prototype.forEach.call(dateList.children, function (c) { c.classList.remove("is-selected"); });
          btn.classList.add("is-selected");
          formStep.hidden = false;
        });
        dateList.appendChild(btn);
      });
      if (dates.length === 0) {
        dateList.innerHTML = '<p class="msg-empty">Aucun créneau disponible pour le moment — contacte-moi directement.</p>';
        formStep.hidden = true;
      }
    }
    renderDates();

    /* Si quelqu'un d'autre réserve pendant que la page est ouverte (démo multi-onglets),
       la liste des dates disponibles se met à jour toute seule. */
    window.addEventListener("storage", function (e) {
      if (e.key === window.RTD_STORE.KEYS.APPOINTMENTS && document.getElementById("rtd-booking-dates")) renderDates();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!selectedDate) return;

      var prenom = form.prenom.value.trim();
      var nom = form.nom.value.trim();
      var email = form.email.value.trim();
      var telephone = form.telephone.value.trim();
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
      if (!consent) { ok = false; statusEl.textContent = "Merci de cocher la case de consentement."; statusEl.className = "form-status form-status--err is-visible"; }

      if (!ok) return;

      window.RTD_STORE.addAppointment({
        prenom: prenom, nom: nom, email: email, telephone: telephone, date: formatDateIso(selectedDate)
      });

      recapEl.textContent = formatDateLabel(selectedDate);
      root.querySelector("#rtd-booking-steps").hidden = true;
      confirmStep.hidden = false;
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
