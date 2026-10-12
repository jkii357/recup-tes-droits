/*
 * store.js — couche de données de la maquette.
 *
 * DÉMO UNIQUEMENT : tout est stocké dans le localStorage du navigateur.
 * Aucun vrai serveur. En production, ce fichier est remplacé par de vrais
 * appels à une API. Les mots de passe sont hashés (SHA-256) avant stockage
 * via SubtleCrypto — plus sérieux qu'un mot de passe en clair, mais ça
 * reste un hash sans sel stocké côté client : pas une vraie sécurité.
 *
 * Nécessite que le site soit servi via http(s):// — ouvert en file://,
 * chaque page peut se voir attribuer une origine différente et le
 * localStorage ne serait plus partagé entre les pages.
 */
(function (global) {
  "use strict";

  var KEYS = {
    SCHEMA_VERSION: "rtd_schema_version",
    APPOINTMENTS: "rtd_appointments",
    CLIENTS: "rtd_clients",
    MESSAGES: "rtd_messages",
    DOCUMENTS: "rtd_documents",
    REVIEWS: "rtd_reviews",
    CLIENT_SESSION: "rtd_client_session"
  };
  var SCHEMA_VERSION = 2;

  var DOCUMENT_TYPES = [
    { id: "piece_identite", label: "Pièce d'identité", hint: "Carte d'identité, passeport, ou titre de séjour en cours de validité" },
    { id: "justificatif_domicile", label: "Justificatif de domicile", hint: "Facture de moins de 3 mois (internet, téléphone, électricité) ou quittance de loyer" },
    { id: "admission_are", label: "Admission ou reprise ARE", hint: "Disponible dans l'onglet « Courrier » de ton espace France Travail" }
  ];

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function readList(key) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeList(key, list) {
    try {
      global.localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      /* quota ou navigateur en mode privé : la démo continue, juste sans persistance */
    }
  }

  function hashPassword(password) {
    if (global.crypto && global.crypto.subtle && global.TextEncoder) {
      var enc = new TextEncoder().encode(String(password));
      return global.crypto.subtle.digest("SHA-256", enc).then(function (buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      });
    }
    /* Repli si SubtleCrypto indisponible (contexte non sécurisé) : encodage réversible, DÉMO seulement. */
    return Promise.resolve("plain:" + btoa(unescape(encodeURIComponent(String(password)))));
  }

  var EXAMPLE_REVIEWS = [
    {
      id: "exemple-1",
      type: "texte",
      auteur: "Sofiane M.",
      note: 5,
      texte: "Je ne comprenais rien aux démarches ACRE et INPI. Tout a été fait pour moi, étape par étape, jusqu'au versement de l'ARCE.",
      exemple: true,
      enAvant: true,
      creeLe: new Date().toISOString()
    },
    {
      id: "exemple-2",
      type: "texte",
      auteur: "Amandine R.",
      note: 5,
      texte: "Un vrai accompagnement du début à la fin. J'ai eu mes deux versements d'ARCE sans avoir à me battre avec France Travail.",
      exemple: true,
      enAvant: true,
      creeLe: new Date().toISOString()
    },
    {
      id: "exemple-3",
      type: "texte",
      auteur: "Karim B.",
      note: 5,
      texte: "Création de ma micro-entreprise réglée en quelques jours. Réponses rapides par téléphone à chaque question.",
      exemple: true,
      enAvant: true,
      creeLe: new Date().toISOString()
    },
    {
      id: "exemple-4",
      type: "video",
      auteur: "Laëtitia P.",
      note: 5,
      texte: "Témoignage vidéo à venir.",
      exemple: true,
      enAvant: true,
      creeLe: new Date().toISOString()
    },
    {
      id: "exemple-5",
      type: "video",
      auteur: "Yacine D.",
      note: 5,
      texte: "Témoignage vidéo à venir.",
      exemple: true,
      enAvant: true,
      creeLe: new Date().toISOString()
    }
  ];

  function init() {
    var currentVersion = parseInt(global.localStorage.getItem(KEYS.SCHEMA_VERSION) || "0", 10);
    if (currentVersion !== SCHEMA_VERSION) {
      /* Changement de schéma (mot de passe client, RDV sans horaire fixe...) : on repart propre
         sur les données de démo plutôt que de migrer d'anciens enregistrements incompatibles. */
      [KEYS.APPOINTMENTS, KEYS.CLIENTS, KEYS.MESSAGES, KEYS.DOCUMENTS, KEYS.CLIENT_SESSION].forEach(function (k) {
        try { global.localStorage.removeItem(k); } catch (e) {}
      });
      global.localStorage.setItem(KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));
    }
    if (readList(KEYS.REVIEWS).length === 0) {
      writeList(KEYS.REVIEWS, EXAMPLE_REVIEWS);
    }
  }

  function todayIso() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function addAppointment(data) {
    var record = {
      id: uid(),
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      date: data.date,
      vu: false,
      creeLe: new Date().toISOString()
    };
    var list = readList(KEYS.APPOINTMENTS);
    list.unshift(record);
    writeList(KEYS.APPOINTMENTS, list);
    return record;
  }

  function getAppointments() {
    return readList(KEYS.APPOINTMENTS);
  }

  /** Dates déjà réservées (à partir d'aujourd'hui) — pour exclure ces jours du widget de RDV. */
  function getBookedDates() {
    var today = todayIso();
    return getAppointments().filter(function (a) { return a.date >= today; }).map(function (a) { return a.date; });
  }

  function countPendingAppointments() {
    return getAppointments().filter(function (a) { return !a.vu; }).length;
  }

  function markAppointmentsSeen() {
    var list = readList(KEYS.APPOINTMENTS);
    var changed = false;
    list.forEach(function (a) { if (!a.vu) { a.vu = true; changed = true; } });
    if (changed) writeList(KEYS.APPOINTMENTS, list);
  }

  function addClient(data) {
    return hashPassword(data.motDePasse).then(function (passwordHash) {
      var record = {
        id: uid(),
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        dateNaissance: data.dateNaissance,
        passwordHash: passwordHash,
        creeLe: new Date().toISOString(),
        etapes: { inpi: "attente", acre: "attente", arce: "attente" }
      };
      var list = readList(KEYS.CLIENTS);
      list.unshift(record);
      writeList(KEYS.CLIENTS, list);
      setCurrentClientId(record.id);
      return record;
    });
  }

  function getClients() {
    return readList(KEYS.CLIENTS);
  }

  function getClient(id) {
    var list = readList(KEYS.CLIENTS);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function findClientByEmail(email) {
    var list = readList(KEYS.CLIENTS);
    var needle = (email || "").trim().toLowerCase();
    for (var i = 0; i < list.length; i++) {
      if ((list[i].email || "").trim().toLowerCase() === needle) return list[i];
    }
    return null;
  }

  /** Vérifie email + mot de passe. Résout le client (et ouvre sa session) ou null. */
  function authenticateClient(email, password) {
    var client = findClientByEmail(email);
    if (!client) return Promise.resolve(null);
    return hashPassword(password).then(function (hash) {
      if (hash === client.passwordHash) {
        setCurrentClientId(client.id);
        return client;
      }
      return null;
    });
  }

  function updateClientEtape(clientId, categorie, valeur) {
    var list = readList(KEYS.CLIENTS);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === clientId) {
        list[i].etapes = list[i].etapes || { inpi: "attente", acre: "attente", arce: "attente" };
        list[i].etapes[categorie] = valeur;
        writeList(KEYS.CLIENTS, list);
        return list[i];
      }
    }
    return null;
  }

  function setCurrentClientId(id) {
    try { global.localStorage.setItem(KEYS.CLIENT_SESSION, id); } catch (e) {}
  }
  function getCurrentClientId() {
    try { return global.localStorage.getItem(KEYS.CLIENT_SESSION); } catch (e) { return null; }
  }
  function getCurrentClient() {
    var id = getCurrentClientId();
    return id ? getClient(id) : null;
  }
  function clearCurrentClient() {
    try { global.localStorage.removeItem(KEYS.CLIENT_SESSION); } catch (e) {}
  }

  function addMessage(clientId, auteur, texte) {
    var record = {
      id: uid(),
      clientId: clientId,
      auteur: auteur,
      texte: texte,
      creeLe: new Date().toISOString(),
      lu: auteur === "admin"
    };
    var list = readList(KEYS.MESSAGES);
    list.push(record);
    writeList(KEYS.MESSAGES, list);
    return record;
  }

  function getMessages(clientId) {
    return readList(KEYS.MESSAGES).filter(function (m) { return m.clientId === clientId; });
  }

  function countUnreadMessages(clientId) {
    return getMessages(clientId).filter(function (m) { return m.auteur === "client" && !m.lu; }).length;
  }

  function countUnreadMessagesTotal() {
    return readList(KEYS.MESSAGES).filter(function (m) { return m.auteur === "client" && !m.lu; }).length;
  }

  function markMessagesRead(clientId) {
    var list = readList(KEYS.MESSAGES);
    var changed = false;
    list.forEach(function (m) {
      if (m.clientId === clientId && m.auteur === "client" && !m.lu) { m.lu = true; changed = true; }
    });
    if (changed) writeList(KEYS.MESSAGES, list);
  }

  function addDocumentMeta(clientId, type, fichier) {
    var record = {
      id: uid(),
      clientId: clientId,
      type: type,
      nomFichier: fichier.name,
      tailleOctets: fichier.size,
      statut: "en_attente",
      creeLe: new Date().toISOString()
    };
    var list = readList(KEYS.DOCUMENTS);
    list.push(record);
    writeList(KEYS.DOCUMENTS, list);
    return record;
  }

  function getDocuments(clientId) {
    return readList(KEYS.DOCUMENTS).filter(function (d) { return d.clientId === clientId; });
  }

  /** Documents fraîchement déposés, pas encore vérifiés par l'admin — tous clients confondus. */
  function countPendingDocumentsTotal() {
    return readList(KEYS.DOCUMENTS).filter(function (d) { return d.statut === "en_attente"; }).length;
  }

  function updateDocumentStatus(docId, statut) {
    var list = readList(KEYS.DOCUMENTS);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === docId) { list[i].statut = statut; writeList(KEYS.DOCUMENTS, list); return list[i]; }
    }
    return null;
  }

  function removeDocument(docId) {
    var list = readList(KEYS.DOCUMENTS).filter(function (d) { return d.id !== docId; });
    writeList(KEYS.DOCUMENTS, list);
  }

  function getReviews(opts) {
    var list = readList(KEYS.REVIEWS);
    if (opts && opts.onlyFeatured) list = list.filter(function (r) { return r.enAvant; });
    return list;
  }

  function toggleReviewFeatured(id) {
    var list = readList(KEYS.REVIEWS);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { list[i].enAvant = !list[i].enAvant; writeList(KEYS.REVIEWS, list); return list[i]; }
    }
    return null;
  }

  /** Nombre total de nouveautés pour l'admin : RDV, documents et messages non encore traités. */
  function getAdminNotificationCount() {
    return countPendingAppointments() + countPendingDocumentsTotal() + countUnreadMessagesTotal();
  }

  function resetDemoData() {
    [KEYS.APPOINTMENTS, KEYS.CLIENTS, KEYS.MESSAGES, KEYS.DOCUMENTS].forEach(function (k) {
      try { global.localStorage.removeItem(k); } catch (e) {}
    });
    writeList(KEYS.REVIEWS, EXAMPLE_REVIEWS);
    clearCurrentClient();
    if (global.RTD_FILES && typeof global.RTD_FILES.clear === "function") {
      global.RTD_FILES.clear();
    }
  }

  global.RTD_STORE = {
    KEYS: KEYS,
    DOCUMENT_TYPES: DOCUMENT_TYPES,
    init: init,
    todayIso: todayIso,
    addAppointment: addAppointment,
    getAppointments: getAppointments,
    getBookedDates: getBookedDates,
    countPendingAppointments: countPendingAppointments,
    markAppointmentsSeen: markAppointmentsSeen,
    addClient: addClient,
    getClients: getClients,
    getClient: getClient,
    findClientByEmail: findClientByEmail,
    authenticateClient: authenticateClient,
    updateClientEtape: updateClientEtape,
    getCurrentClient: getCurrentClient,
    setCurrentClientId: setCurrentClientId,
    clearCurrentClient: clearCurrentClient,
    addMessage: addMessage,
    getMessages: getMessages,
    countUnreadMessages: countUnreadMessages,
    countUnreadMessagesTotal: countUnreadMessagesTotal,
    markMessagesRead: markMessagesRead,
    addDocumentMeta: addDocumentMeta,
    getDocuments: getDocuments,
    countPendingDocumentsTotal: countPendingDocumentsTotal,
    updateDocumentStatus: updateDocumentStatus,
    removeDocument: removeDocument,
    getReviews: getReviews,
    toggleReviewFeatured: toggleReviewFeatured,
    getAdminNotificationCount: getAdminNotificationCount,
    resetDemoData: resetDemoData
  };

  init();
})(window);
