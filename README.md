# Maquette — Récup tes Droits

Maquette commerciale pour **Récup tes Droits**, auto-entrepreneur qui accompagne les demandeurs d'emploi de la création de leur entreprise (INPI) jusqu'au déblocage de leurs droits ARCE (ACRE/URSSAF puis France Travail). HTML / CSS / JavaScript purs : **aucune installation, aucun build**.

Direction visuelle : « L'avis officiel » — logo badge/tampon, fond bleu nuit, avis « papier » épinglés dessus, accent rouge. Détails dans `.impeccable/surfaces/index-html.md` et `PRODUCT.md`.

**Ceci est une maquette de présentation, pas un site en production.** Une bannière le rappelle en haut de chaque page. Les formulaires fonctionnent réellement (ils sauvegardent dans le navigateur) pour que la démo soit convaincante, mais rien n'est envoyé à un vrai serveur.

## Voir le site

En ligne : **[à compléter une fois la page GitHub Pages activée]**.

En local — contrairement à un site vitrine classique, **ne double-clique pas sur `index.html`**. Ce site a plusieurs pages (espace client, espace admin) qui partagent des données entre elles via le navigateur (`localStorage`) : il faut que tout soit servi depuis la même origine `http://`, sinon ces fonctionnalités ne marchent pas de façon fiable.

```bash
python3 serve.py 8770
```

Puis ouvre **http://localhost:8770**. (Avec Claude Code / l'extension Claude Browser, le fichier `.claude/launch.json` fait déjà tourner ce serveur automatiquement.) `serve.py` sert les fichiers exactement comme `python3 -m http.server`, mais désactive le cache du navigateur — sans ça, après avoir modifié `store.js` ou `style.css`, le navigateur peut continuer d'afficher l'ancienne version et faire croire à un bug qui n'existe pas (vécu pendant le développement de cette maquette).

## Parcourir la démo

- **Site public** : `/index.html` — explication du service, avis, FAQ, prise de RDV.
- **Espace client** : bouton « Créer mon espace client » → inscription avec nom/prénom/email/téléphone/date de naissance **+ mot de passe**. Un compte existant redirige vers `/espace-client/connexion.html` (email + mot de passe) plutôt que d'être recréé. Le mot de passe est hashé (SHA-256) avant d'être stocké — correct pour une démo, pas pour de la vraie production (voir tableau plus bas). Le tableau de bord a 3 onglets : suivi du dossier (lecture seule), dépôt de documents (pièce d'identité, justificatif de domicile, admission ou reprise ARE), messagerie.
- **Espace admin** : `/espace-admin/connexion.html`, code d'accès **`RTD2026`** (volontairement non affiché à l'écran — garde-le pour toi). Vue d'ensemble des RDV et inscriptions, bandeau et pastille « Nouveautés » dès qu'un RDV, un document ou un message arrive, et fiche détaillée par client (clic sur son nom) pour changer le statut de son dossier (Attente / En cours / Terminé sur INPI, ACRE, ARCE), consulter ses documents et répondre à ses messages.

Pour voir la boucle complète : ouvre le site public dans un onglet, réserve un RDV, crée un espace client, dépose un document et pose une question — puis ouvre l'espace admin dans un **autre onglet du même navigateur** pour voir tout apparaître (avec la pastille « Nouveautés ») et y répondre. Reviens sur l'onglet client pour voir le statut mis à jour.

Le bouton **« Réinitialiser la démo »** en bas de l'espace admin efface les RDV/clients/messages/documents de test et remet les avis d'exemple, pour repartir propre avant une présentation.

## Fichiers

```
index.html                                  Accueil
espace-client/inscription.html              Création d'espace client (+ mot de passe)
espace-client/connexion.html                Connexion client (email + mot de passe)
espace-client/tableau-de-bord.html          Suivi dossier / documents / messagerie (client)
espace-admin/connexion.html                 Accès équipe (code démo)
espace-admin/tableau-de-bord.html           Vue d'ensemble admin + bandeau « Nouveautés »
espace-admin/client.html                    Fiche client (édition dossier, documents, messages)
mentions-legales.html / politique-de-confidentialite.html / cgu.html   Pages légales (placeholder)

assets/css/style.css        Tokens + styles partagés (bannière, header, footer, boutons, avis...)
assets/css/client.css       Espace client (cartes, onglets, messagerie)
assets/css/admin.css        Espace admin (tableaux, sélecteurs de statut, notifications)
assets/js/store.js          Données de démo (localStorage) : RDV, clients, messages, documents, avis, notifications
assets/js/files-db.js       Fichiers déposés (IndexedDB)
assets/js/chrome.js         Injecte bannière + header (+ pastille notifications admin) + footer
assets/js/booking.js        Widget de prise de RDV — dates uniquement, dispo en direct (accueil)
assets/js/reviews.js        Avis/témoignages affichés (accueil)
assets/js/client-inscription.js / client-connexion.js / client-dashboard.js
assets/js/admin-auth.js / admin-dashboard.js / admin-client.js
assets/img/logo/logo-recup-tes-droits.svg   Logo

PRODUCT.md                  Contexte produit (écrit avec le skill impeccable)
DESIGN.md                   Système visuel documenté (écrit en fin de build)
google-business-profile.md  Contenu prêt à coller + guide pour la fiche Google (hors site)
serve.py                    Serveur de prévisualisation locale, sans cache navigateur
```

## Prise de RDV : comment ça marche

`booking.js` propose toujours les 6 prochains jours ouvrés **à partir d'aujourd'hui**, en excluant automatiquement les dates déjà réservées par quelqu'un d'autre (`RTD_STORE.getBookedDates()`) — si les dates proches sont prises, la liste avance plus loin dans le temps pour en garder 6 de disponibles. Pas d'horaire précis à choisir : la confirmation annonce un rappel téléphonique pour fixer l'heure. Si un RDV est pris dans un autre onglet pendant que la page est ouverte, la liste se rafraîchit toute seule.

## Nouvelle page ? (si tu étends la maquette)

Chaque page a besoin de : charger `/assets/css/style.css` (+ `client.css`/`admin.css` si espace client/admin), définir `<body data-page="...">` (`home`, `legal`, `client-auth`, `client-app`, `admin-auth`, `admin-app`), et charger `/assets/js/chrome.js` (après `store.js` si la page utilise les données). Tous les liens/assets utilisent des **chemins racine** (`/assets/...`, `/index.html`), pas des chemins relatifs.

## Limites assumées de cette démo (à refaire en production)

| Sujet | Dans cette maquette | En production |
|---|---|---|
| Données (RDV, clients, messages, avis) | `localStorage` du navigateur, propre à chaque appareil | Vraie base de données côté serveur |
| Documents déposés | `IndexedDB` du navigateur, non chiffré | Stockage sécurisé côté serveur, chiffré, accès contrôlé — important car ce sont des pièces d'identité |
| Mot de passe client | Hashé (SHA-256) côté navigateur, sans sel, sans serveur | Vraie authentification côté serveur (hash + sel, ou prestataire d'auth) |
| Connexion admin | Code fixe en clair dans le JavaScript (`RTD2026`) | Vraie authentification côté serveur |
| Prise de RDV | Widget visuel, dates réelles mais pas de vrai agenda partagé | Vrai compte Calendly (ou équivalent) connecté |
| Avis Google | Emplacement réservé sur l'accueil | Vraie fiche Google Business Profile — voir `google-business-profile.md` |
| Avis / témoignages | Contenu d'exemple, clairement étiqueté | Vrais avis et vidéos du client, à collecter |

## À faire avant toute mise en ligne réelle

1. **Remplacer les coordonnées placeholder** : téléphone et email dans le footer (`[Téléphone à renseigner]`, `[Email à renseigner]`), SIRET/adresse/directeur de publication dans `mentions-legales.html`.
2. **Faire valider les 3 pages légales par un professionnel du droit** (encadrés en pointillés rouges = à compléter).
3. **Remplacer les avis et témoignages vidéo d'exemple** par de vrais avis du client (badge « Avis exemple » à retirer).
4. **Créer la fiche Google Business Profile** du client (voir `google-business-profile.md`) et brancher le vrai lien dans le bloc « Donne ton avis sur Google » de l'accueil.
5. **Connecter un vrai compte Calendly** (ou garder un widget maison, mais relié à un vrai agenda).
6. **Préciser la liste des documents** si d'autres pièces sont nécessaires (actuellement : pièce d'identité, justificatif de domicile, admission/reprise ARE) — tout se règle dans `DOCUMENT_TYPES` en haut de `assets/js/store.js`.
7. **Remplacer toute la couche démo (`store.js`, `files-db.js`, `admin-auth.js`)** par une vraie API, une vraie base de données et une vraie authentification — en particulier pour les documents d'identité et les mots de passe.
8. Retirer la bannière maquette et les balises `noindex` une fois le vrai site prêt.

## Prévisualiser / revérifier le design

```bash
python3 serve.py 8770
sh ~/.claude/skills/impeccable/scripts/impeccable detect --json index.html assets/css/style.css assets/css/client.css assets/css/admin.css
```
