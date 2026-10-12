/*
 * files-db.js — stockage des fichiers déposés (IndexedDB).
 *
 * DÉMO UNIQUEMENT : les fichiers restent dans le navigateur de la personne
 * qui les dépose, non chiffrés. Une pièce d'identité est une donnée très
 * sensible — ne jamais déposer de vrai document ici tant que ce n'est pas
 * la version en production, avec un vrai stockage sécurisé côté serveur.
 */
(function (global) {
  "use strict";

  var DB_NAME = "rtd_files";
  var STORE_NAME = "fichiers";
  var dbPromise = null;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!global.indexedDB) { resolve(null); return; }
      var req = global.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        req.result.createObjectStore(STORE_NAME);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { resolve(null); };
    });
    return dbPromise;
  }

  function put(id, blob) {
    return openDb().then(function (db) {
      if (!db) return false;
      return new Promise(function (resolve) {
        var tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(blob, id);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { resolve(false); };
      });
    });
  }

  function get(id) {
    return openDb().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        var tx = db.transaction(STORE_NAME, "readonly");
        var req = tx.objectStore(STORE_NAME).get(id);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { resolve(null); };
      });
    });
  }

  function remove(id) {
    return openDb().then(function (db) {
      if (!db) return false;
      return new Promise(function (resolve) {
        var tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { resolve(false); };
      });
    });
  }

  function clear() {
    return openDb().then(function (db) {
      if (!db) return false;
      return new Promise(function (resolve) {
        var tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { resolve(false); };
      });
    });
  }

  /** Ouvre le fichier dans un nouvel onglet via une object URL temporaire. */
  function openInNewTab(id) {
    return get(id).then(function (blob) {
      if (!blob) return false;
      var url = URL.createObjectURL(blob);
      global.open(url, "_blank");
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      return true;
    });
  }

  global.RTD_FILES = { put: put, get: get, remove: remove, clear: clear, openInNewTab: openInNewTab };
})(window);
