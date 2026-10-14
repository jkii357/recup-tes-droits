/*
 * store.js — couche de données de la maquette, sur Cloud Firestore.
 *
 * Les données (RDV, clients, messages, documents, avis) sont partagées entre
 * tous les appareils via le projet Firebase "Recup Tes Droits" — voir
 * firebase-config.js, chargé juste avant ce fichier. Toutes les fonctions de
 * lecture/écriture renvoient donc des Promises.
 *
 * Les fichiers déposés (documents, vidéos de témoignage) restent eux
 * stockés localement dans le navigateur de la personne qui les dépose (voir
 * files-db.js) : seules leurs métadonnées (nom, taille, statut) sont
 * partagées. Faire aussi voyager les fichiers eux-mêmes demanderait Firebase
 * Storage, pas fait ici.
 *
 * Sécurité : les règles Firestore de ce projet sont volontairement ouvertes
 * (pas d'authentification Firebase réelle — l'admin et les clients
 * s'identifient toujours côté client, comme avant). Voir le commentaire en
 * tête des règles, dans la console Firebase. DÉMO UNIQUEMENT.
 */
(function (global) {
  "use strict";

  var COL = {
    APPOINTMENTS: "appointments",
    CLIENTS: "clients",
    MESSAGES: "messages",
    DOCUMENTS: "documents",
    REVIEWS: "reviews"
  };
  var CLIENT_SESSION_KEY = "rtd_client_session";

  var DOCUMENT_TYPES = [
    { id: "piece_identite", label: "Pièce d'identité", hint: "Carte d'identité, passeport, ou titre de séjour en cours de validité" },
    { id: "justificatif_domicile", label: "Justificatif de domicile", hint: "Facture de moins de 3 mois (internet, téléphone, électricité) ou quittance de loyer" },
    { id: "admission_are", label: "Admission ou reprise ARE", hint: "Disponible dans l'onglet « Courrier » de ton espace France Travail" }
  ];

  function db() { return global.RTD_DB; }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function sortByCreeLe(list, dir) {
    list.sort(function (a, b) {
      var av = a.creeLe || "", bv = b.creeLe || "";
      return dir === "asc" ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    });
    return list;
  }

  function snapToList(snap) {
    var out = [];
    snap.forEach(function (doc) { out.push(doc.data()); });
    return out;
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
    db().collection(COL.REVIEWS).limit(1).get().then(function (snap) {
      if (snap.empty) {
        var batch = db().batch();
        EXAMPLE_REVIEWS.forEach(function (r) {
          batch.set(db().collection(COL.REVIEWS).doc(r.id), r);
        });
        return batch.commit();
      }
    }).catch(function (e) { console.error("Initialisation des avis d'exemple échouée :", e); });
  }

  function todayIso() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* ----------------------------- RDV ----------------------------- */

  function addAppointment(data) {
    var record = {
      id: uid(),
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      date: data.date,
      heure: data.heure,
      vu: false,
      creeLe: new Date().toISOString()
    };
    return db().collection(COL.APPOINTMENTS).doc(record.id).set(record).then(function () { return record; });
  }

  function getAppointments() {
    return db().collection(COL.APPOINTMENTS).orderBy("creeLe", "desc").get().then(snapToList);
  }

  /** Couples date+heure déjà réservés (à partir d'aujourd'hui) — pour exclure précisément
      ce créneau du widget de RDV, sans bloquer les autres heures du même jour. */
  function getBookedSlots() {
    var today = todayIso();
    return db().collection(COL.APPOINTMENTS).where("date", ">=", today).get().then(function (snap) {
      return snapToList(snap).map(function (a) { return a.date + "|" + a.heure; });
    });
  }

  function countPendingAppointments() {
    return db().collection(COL.APPOINTMENTS).where("vu", "==", false).get().then(function (snap) { return snap.size; });
  }

  function markAppointmentsSeen() {
    return db().collection(COL.APPOINTMENTS).where("vu", "==", false).get().then(function (snap) {
      if (snap.empty) return;
      var batch = db().batch();
      snap.forEach(function (doc) { batch.update(doc.ref, { vu: true }); });
      return batch.commit();
    });
  }

  /** Abonnement temps réel aux RDV — pour rafraîchir le widget de prise de RDV
      (ou la liste admin) dès qu'une réservation est faite, même depuis un autre
      appareil. Renvoie une fonction de désabonnement. */
  function watchAppointments(callback) {
    return db().collection(COL.APPOINTMENTS).onSnapshot(function (snap) {
      callback(sortByCreeLe(snapToList(snap), "desc"));
    }, function (e) { console.error("Suivi des RDV échoué :", e); });
  }

  /* --------------------------- Clients --------------------------- */

  function addClient(data) {
    return hashPassword(data.motDePasse).then(function (passwordHash) {
      var record = {
        id: uid(),
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        codePostal: data.codePostal,
        dateNaissance: data.dateNaissance,
        passwordHash: passwordHash,
        creeLe: new Date().toISOString(),
        etapes: { inpi: "attente", acre: "attente", arce: "attente" }
      };
      return db().collection(COL.CLIENTS).doc(record.id).set(record).then(function () {
        setCurrentClientId(record.id, true);
        return record;
      });
    });
  }

  function getClients() {
    return db().collection(COL.CLIENTS).orderBy("creeLe", "desc").get().then(snapToList);
  }

  /** Abonnement temps réel à la liste des clients — l'admin voit apparaître
      un nouveau client dès son inscription, même depuis un autre appareil. */
  function watchClients(callback) {
    return db().collection(COL.CLIENTS).onSnapshot(function (snap) {
      callback(sortByCreeLe(snapToList(snap), "desc"));
    }, function (e) { console.error("Suivi des clients échoué :", e); });
  }

  function getClient(id) {
    if (!id) return Promise.resolve(null);
    return db().collection(COL.CLIENTS).doc(id).get().then(function (doc) {
      return doc.exists ? doc.data() : null;
    });
  }

  function findClientByEmail(email) {
    var needle = (email || "").trim().toLowerCase();
    if (!needle) return Promise.resolve(null);
    return db().collection(COL.CLIENTS).get().then(function (snap) {
      var found = null;
      snap.forEach(function (doc) {
        var c = doc.data();
        if (!found && (c.email || "").trim().toLowerCase() === needle) found = c;
      });
      return found;
    });
  }

  /** Vérifie email + mot de passe. Résout le client (et ouvre sa session) ou null.
      remember (def. true) : session en localStorage (survit à la fermeture du
      navigateur) si true, en sessionStorage (effacée à la fermeture de l'onglet)
      si false — pour l'option "Se souvenir de moi" de l'écran de connexion. */
  function authenticateClient(email, password, remember) {
    return findClientByEmail(email).then(function (client) {
      if (!client) return null;
      return hashPassword(password).then(function (hash) {
        if (hash === client.passwordHash) {
          setCurrentClientId(client.id, remember !== false);
          return client;
        }
        return null;
      });
    });
  }

  function updateClientEtape(clientId, categorie, valeur) {
    var patch = {};
    patch["etapes." + categorie] = valeur;
    return db().collection(COL.CLIENTS).doc(clientId).update(patch);
  }

  /* remember=true (défaut) : session durable (localStorage). remember=false :
     session effacée à la fermeture de l'onglet (sessionStorage) — pour les
     postes partagés, quand "Se souvenir de moi" est décoché. Cette session
     reste locale à l'appareil : seule l'identité "qui est connecté ici"
     reste locale, les données du client, elles, viennent de Firestore. */
  function setCurrentClientId(id, remember) {
    try {
      if (remember === false) {
        global.sessionStorage.setItem(CLIENT_SESSION_KEY, id);
        global.localStorage.removeItem(CLIENT_SESSION_KEY);
      } else {
        global.localStorage.setItem(CLIENT_SESSION_KEY, id);
        global.sessionStorage.removeItem(CLIENT_SESSION_KEY);
      }
    } catch (e) {}
  }
  function getCurrentClientId() {
    try {
      return global.localStorage.getItem(CLIENT_SESSION_KEY) || global.sessionStorage.getItem(CLIENT_SESSION_KEY);
    } catch (e) { return null; }
  }
  function getCurrentClient() {
    return getClient(getCurrentClientId());
  }
  function clearCurrentClient() {
    try {
      global.localStorage.removeItem(CLIENT_SESSION_KEY);
      global.sessionStorage.removeItem(CLIENT_SESSION_KEY);
    } catch (e) {}
  }

  /* --------------------------- Messages --------------------------- */

  function addMessage(clientId, auteur, texte) {
    var record = {
      id: uid(),
      clientId: clientId,
      auteur: auteur,
      texte: texte,
      creeLe: new Date().toISOString(),
      lu: auteur === "admin"
    };
    return db().collection(COL.MESSAGES).doc(record.id).set(record).then(function () { return record; });
  }

  function getMessages(clientId) {
    return db().collection(COL.MESSAGES).where("clientId", "==", clientId).get().then(function (snap) {
      return sortByCreeLe(snapToList(snap), "asc");
    });
  }

  function countUnreadMessages(clientId) {
    return db().collection(COL.MESSAGES).where("clientId", "==", clientId).get().then(function (snap) {
      return snapToList(snap).filter(function (m) { return m.auteur === "client" && !m.lu; }).length;
    });
  }

  function countUnreadMessagesTotal() {
    return db().collection(COL.MESSAGES).where("auteur", "==", "client").get().then(function (snap) {
      return snapToList(snap).filter(function (m) { return !m.lu; }).length;
    });
  }

  function markMessagesRead(clientId) {
    return db().collection(COL.MESSAGES).where("clientId", "==", clientId).get().then(function (snap) {
      var batch = db().batch();
      var changed = false;
      snap.forEach(function (doc) {
        var m = doc.data();
        if (m.auteur === "client" && !m.lu) { batch.update(doc.ref, { lu: true }); changed = true; }
      });
      return changed ? batch.commit() : null;
    });
  }

  /** Abonnement temps réel au fil de messages d'un client — pour un effet
      messagerie en direct côté admin comme côté client. */
  function watchMessages(clientId, callback) {
    return db().collection(COL.MESSAGES).where("clientId", "==", clientId).onSnapshot(function (snap) {
      callback(sortByCreeLe(snapToList(snap), "asc"));
    }, function (e) { console.error("Suivi des messages échoué :", e); });
  }

  /* --------------------------- Documents --------------------------- */

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
    return db().collection(COL.DOCUMENTS).doc(record.id).set(record).then(function () { return record; });
  }

  function getDocuments(clientId) {
    return db().collection(COL.DOCUMENTS).where("clientId", "==", clientId).get().then(function (snap) {
      return sortByCreeLe(snapToList(snap), "asc");
    });
  }

  /** Documents fraîchement déposés, pas encore vérifiés par l'admin — tous clients confondus. */
  function countPendingDocumentsTotal() {
    return db().collection(COL.DOCUMENTS).where("statut", "==", "en_attente").get().then(function (snap) { return snap.size; });
  }

  function updateDocumentStatus(docId, statut) {
    return db().collection(COL.DOCUMENTS).doc(docId).update({ statut: statut });
  }

  function removeDocument(docId) {
    return db().collection(COL.DOCUMENTS).doc(docId).delete();
  }

  /* --------------------------- Avis --------------------------- */

  function getReviews(opts) {
    return db().collection(COL.REVIEWS).orderBy("creeLe", "desc").get().then(function (snap) {
      var list = snapToList(snap);
      if (opts && opts.onlyFeatured) list = list.filter(function (r) { return r.enAvant; });
      return list;
    });
  }

  function toggleReviewFeatured(id) {
    return db().collection(COL.REVIEWS).doc(id).get().then(function (doc) {
      if (!doc.exists) return null;
      var enAvant = !doc.data().enAvant;
      return doc.ref.update({ enAvant: enAvant }).then(function () { return enAvant; });
    });
  }

  /** Ajoute un vrai avis (texte) ou témoignage (vidéo), déposé depuis l'espace admin.
      data.type: "texte" | "video". Pour une vidéo, le fichier est stocké à part dans
      RTD_FILES (IndexedDB, local à cet appareil), avec l'id du avis lui-même comme clé. */
  function addReview(data) {
    var record = {
      id: uid(),
      type: data.type,
      auteur: data.auteur,
      note: data.note || 5,
      texte: data.texte || "",
      exemple: false,
      enAvant: true,
      creeLe: new Date().toISOString()
    };
    return db().collection(COL.REVIEWS).doc(record.id).set(record).then(function () { return record; });
  }

  function removeReview(id) {
    return db().collection(COL.REVIEWS).doc(id).delete().then(function () {
      if (global.RTD_FILES) global.RTD_FILES.remove(id);
    });
  }

  /* --------------------------- Divers --------------------------- */

  /** Nombre total de nouveautés pour l'admin : RDV, documents et messages non encore traités. */
  function getAdminNotificationCount() {
    return Promise.all([countPendingAppointments(), countPendingDocumentsTotal(), countUnreadMessagesTotal()])
      .then(function (vals) { return vals[0] + vals[1] + vals[2]; });
  }

  function deleteAllInCollection(name) {
    return db().collection(name).get().then(function (snap) {
      if (snap.empty) return;
      var batch = db().batch();
      snap.forEach(function (doc) { batch.delete(doc.ref); });
      return batch.commit();
    });
  }

  function resetDemoData() {
    return Promise.all([
      deleteAllInCollection(COL.APPOINTMENTS),
      deleteAllInCollection(COL.CLIENTS),
      deleteAllInCollection(COL.MESSAGES),
      deleteAllInCollection(COL.DOCUMENTS),
      deleteAllInCollection(COL.REVIEWS)
    ]).then(function () {
      clearCurrentClient();
      if (global.RTD_FILES && typeof global.RTD_FILES.clear === "function") global.RTD_FILES.clear();
      var batch = db().batch();
      EXAMPLE_REVIEWS.forEach(function (r) { batch.set(db().collection(COL.REVIEWS).doc(r.id), r); });
      return batch.commit();
    });
  }

  global.RTD_STORE = {
    DOCUMENT_TYPES: DOCUMENT_TYPES,
    init: init,
    todayIso: todayIso,
    addAppointment: addAppointment,
    getAppointments: getAppointments,
    getBookedSlots: getBookedSlots,
    countPendingAppointments: countPendingAppointments,
    markAppointmentsSeen: markAppointmentsSeen,
    watchAppointments: watchAppointments,
    addClient: addClient,
    getClients: getClients,
    watchClients: watchClients,
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
    watchMessages: watchMessages,
    addDocumentMeta: addDocumentMeta,
    getDocuments: getDocuments,
    countPendingDocumentsTotal: countPendingDocumentsTotal,
    updateDocumentStatus: updateDocumentStatus,
    removeDocument: removeDocument,
    getReviews: getReviews,
    toggleReviewFeatured: toggleReviewFeatured,
    addReview: addReview,
    removeReview: removeReview,
    getAdminNotificationCount: getAdminNotificationCount,
    resetDemoData: resetDemoData
  };

  init();
})(window);
