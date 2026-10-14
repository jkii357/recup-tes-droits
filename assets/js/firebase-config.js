/*
 * firebase-config.js — connexion au projet Firebase "Recup Tes Droits"
 * (Cloud Firestore), qui remplace le localStorage comme source de données
 * partagée entre tous les appareils. À charger après firebase-app-compat.js
 * et firebase-firestore-compat.js, avant store.js.
 *
 * La "clé API" ci-dessous n'est pas un secret : pour une app web Firebase,
 * elle identifie seulement le projet et peut apparaître dans le code source
 * sans risque. C'est la configuration des règles de sécurité Firestore (côté
 * console Firebase) qui protège réellement les données.
 */
(function () {
  "use strict";

  var firebaseConfig = {
    apiKey: "AIzaSyAurmpIKwwr4OQLoHrzthasyj-xIvCwYcI",
    authDomain: "recup-tes-droits.firebaseapp.com",
    projectId: "recup-tes-droits",
    storageBucket: "recup-tes-droits.firebasestorage.app",
    messagingSenderId: "1007494275905",
    appId: "1:1007494275905:web:2fdc467c066c0e52a1f7c0"
  };

  firebase.initializeApp(firebaseConfig);
  window.RTD_DB = firebase.firestore();
})();
