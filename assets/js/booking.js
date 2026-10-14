/*
 * booking.js — widget de prise de RDV (page d'accueil). Créneaux toutes les
 * 30 min, 9h-19h, du lundi au samedi. Un couple date+heure déjà réservé par
 * quelqu'un d'autre (sur n'importe quel appareil, les RDV étant partagés via
 * Firestore) disparaît de la liste — les autres heures du même jour restent
 * proposées.
 */
(function () {
  "use strict";

  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var NB_DATES = 8;
  var HEURE_DEBUT = 9;
  var HEURE_FIN = 19;

  function pad2(n) { return String(n).length < 2 ? "0" + n : String(n); }

  function allTimeSlots() {
    var slots = [];
    for (var h = HEURE_DEBUT; h <= HEURE_FIN; h++) {
      slots.push(pad2(h) + "h00");
      if (h < HEURE_FIN) slots.push(pad2(h) + "h30");
    }
    return slots;
  }
  var ALL_SLOTS = allTimeSlots();

  function formatDateLabel(d) {
    return JOURS[d.getDay()] + " " + d.getDate() + " " + MOIS[d.getMonth()];
  }
  function formatDateIso(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }
  function formatTodayLabel() {
    var d = new Date();
    return JOURS[d.getDay()] + " " + d.getDate() + " " + MOIS[d.getMonth()] + " " + d.getFullYear();
  }

  /** Prochains jours ouvrés (lundi à samedi) ayant au moins un créneau libre. */
  function nextAvailableDates(count, bookedSlots) {
    var out = [];
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    var guard = 0;
    while (out.length < count && guard < 120) {
      guard++;
      var day = d.getDay();
      var iso = formatDateIso(d);
      if (day !== 0) {
        var hasFreeSlot = ALL_SLOTS.some(function (h) { return bookedSlots.indexOf(iso + "|" + h) === -1; });
        if (hasFreeSlot) out.push(new Date(d.getTime()));
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
    var selectedHeure = null;
    var dateList = root.querySelector("#rtd-booking-dates");
    var slotWrap = root.querySelector("#rtd-booking-slot-wrap");
    var slotList = root.querySelector("#rtd-booking-slots");
    var todayEl = root.querySelector("#rtd-booking-today");
    var formStep = root.querySelector("#rtd-booking-form-step");
    var confirmStep = root.querySelector("#rtd-booking-confirm");
    var form = root.querySelector("#rtd-booking-form");
    var recapEl = root.querySelector("#rtd-booking-recap");
    var statusEl = root.querySelector("#rtd-booking-status");

    if (todayEl) todayEl.textContent = "Aujourd'hui, " + formatTodayLabel();

    function bookedSlotsFrom(appointments) {
      var today = window.RTD_STORE.todayIso();
      return appointments.filter(function (a) { return a.date >= today; }).map(function (a) { return a.date + "|" + a.heure; });
    }

    function renderSlots(bookedSlots) {
      slotList.innerHTML = "";
      var iso = formatDateIso(selectedDate);
      ALL_SLOTS.forEach(function (h) {
        var taken = bookedSlots.indexOf(iso + "|" + h) !== -1;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "rtd-slot-chip" + (taken ? " is-taken" : "");
        btn.textContent = h;
        if (taken) {
          btn.disabled = true;
        } else {
          btn.addEventListener("click", function () {
            selectedHeure = h;
            Array.prototype.forEach.call(slotList.children, function (c) { c.classList.remove("is-selected"); });
            btn.classList.add("is-selected");
            formStep.hidden = false;
          });
        }
        slotList.appendChild(btn);
      });
    }

    function renderDates(bookedSlots) {
      var dates = nextAvailableDates(NB_DATES, bookedSlots);
      dateList.innerHTML = "";
      dates.forEach(function (d, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "rtd-slot-chip";
        btn.textContent = formatDateLabel(d);
        if (i === 0) btn.classList.add("is-selected");
        btn.addEventListener("click", function () {
          selectedDate = d;
          selectedHeure = null;
          formStep.hidden = true;
          Array.prototype.forEach.call(dateList.children, function (c) { c.classList.remove("is-selected"); });
          btn.classList.add("is-selected");
          slotWrap.hidden = false;
          renderSlots(lastBookedSlots);
        });
        dateList.appendChild(btn);
      });
      if (dates.length === 0) {
        dateList.innerHTML = '<p class="msg-empty">Aucun créneau disponible pour le moment — contacte-moi directement.</p>';
        slotWrap.hidden = true;
        formStep.hidden = true;
        return;
      }
      /* Si la date sélectionnée n'existe plus (vient d'être entièrement prise
         par quelqu'un d'autre), on retombe sur la première disponible. */
      if (!selectedDate || !dates.some(function (d) { return formatDateIso(d) === formatDateIso(selectedDate); })) {
        selectedDate = dates[0];
      } else {
        dateList.querySelectorAll(".rtd-slot-chip").forEach(function (c) {
          c.classList.toggle("is-selected", c.textContent === formatDateLabel(selectedDate));
        });
      }
      slotWrap.hidden = false;
      renderSlots(bookedSlots);
    }

    var lastBookedSlots = [];
    /* Abonnement en direct : si quelqu'un réserve pendant que la page est
       ouverte — même depuis un autre appareil — les dates et créneaux
       affichés se mettent à jour tout seuls. */
    window.RTD_STORE.watchAppointments(function (appointments) {
      lastBookedSlots = bookedSlotsFrom(appointments);
      renderDates(lastBookedSlots);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!selectedDate || !selectedHeure) return;

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

      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      /* Dernière vérification juste avant l'envoi : si quelqu'un a pris ce créneau
         entre-temps, on prévient plutôt que de créer un doublon. */
      window.RTD_STORE.getBookedSlots().then(function (bookedSlots) {
        var stillFree = bookedSlots.indexOf(formatDateIso(selectedDate) + "|" + selectedHeure) === -1;
        if (!stillFree) {
          submitBtn.disabled = false;
          statusEl.textContent = "Ce créneau vient d'être pris par quelqu'un d'autre — choisis-en un autre.";
          statusEl.className = "form-status form-status--err is-visible";
          renderSlots(bookedSlots);
          formStep.hidden = true;
          return;
        }

        return window.RTD_STORE.addAppointment({
          prenom: prenom, nom: nom, email: email, telephone: telephone,
          date: formatDateIso(selectedDate), heure: selectedHeure
        }).then(function () {
          recapEl.textContent = formatDateLabel(selectedDate) + " à " + selectedHeure;
          root.querySelector("#rtd-booking-steps").hidden = true;
          confirmStep.hidden = false;
        });
      }).catch(function (e) {
        submitBtn.disabled = false;
        statusEl.textContent = "Une erreur est survenue, réessaie dans un instant.";
        statusEl.className = "form-status form-status--err is-visible";
        console.error(e);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
