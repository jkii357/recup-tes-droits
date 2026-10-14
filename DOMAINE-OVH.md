# Connecter le nom de domaine OVH (recuptesdroits.fr) au site

Le site est hébergé sur GitHub Pages (**https://jkii357.github.io/recup-tes-droits/**). Pour qu'il réponde sur **recuptesdroits.fr**, il faut dire à OVH où envoyer les visiteurs (ça, c'est toi/ton client qui le fait, je n'ai pas accès à son compte OVH) — le reste, je l'ai déjà préparé côté GitHub.

## Le message « Site en construction » que tu vois actuellement, c'est normal

Si tu tapes `recuptesdroits.fr` dans un navigateur aujourd'hui, tu tombes sur une page OVH « Site en construction ». Ce n'est pas un bug et il n'y a rien à cliquer dessus : c'est la page par défaut qu'OVH affiche pour **n'importe quel nom de domaine qui n'a pas encore été branché sur un site**, un peu comme un panonceau "local vide" devant un magasin. Elle disparaîtra toute seule une fois les étapes ci-dessous faites — pas besoin de la désactiver nulle part.

Bonne nouvelle au passage : le fait que ce soit OVH qui affiche cette page prouve que c'est bien OVH qui gère le DNS de ce domaine. On est donc au bon endroit pour le brancher (étapes ci-dessous).

## Ce que j'ai déjà fait

- Ajouté un fichier `CNAME` à la racine du site contenant `recuptesdroits.fr` (c'est ce qui dit à GitHub Pages "sers ce site aussi sur ce domaine").
- Poussé ce fichier sur GitHub : dès que GitHub Pages le détecte, il active lui-même le domaine personnalisé dans les réglages du dépôt — aucune action manuelle supplémentaire n'est nécessaire côté GitHub.

## ✅ Fait — configuration DNS terminée (13/10/2026)

Tu as obtenu un accès admin séparé sur le compte OVH du client (utilisateur `service-rtd`, voir plus bas), et j'ai fait la configuration directement depuis cet accès :

- Supprimé l'ancien enregistrement `@ A 51.91.236.255` (l'hébergement OVH par défaut, celui qui affichait la page « en construction »).
- Supprimé les restes sur `www` (`A 51.91.236.255` et un `TXT "3|welcome"` qui bloquaient l'ajout du CNAME).
- Les 4 enregistrements **A** vers GitHub sont bien présents sur `@` : `185.199.108/109/110/111.153` (vérifié directement sur le serveur DNS d'OVH).
- Ajouté `www CNAME → jkii357.github.io.` (déjà visible publiquement au moment de la vérification).

Propagation terminée — `http://recuptesdroits.fr` affiche déjà le vrai site. Côté HTTPS : GitHub a validé le DNS et a mis le certificat gratuit en **file d'attente d'émission** (automatique, je ne peux pas accélérer). Dès qu'il sera émis, j'activerai **« Enforce HTTPS »** — pas d'action de ta part, je repasserai vérifier.

## Ton accès admin personnel sur le compte OVH du client

Le client t'a créé un utilisateur séparé dans son compte OVH (Identité, Sécurité & Opérations → Identités → Utilisateurs locaux), pour que tu puisses gérer `recuptesdroits.fr` sans jamais utiliser son mot de passe principal :

- **Identifiant de connexion** : `ie52899-ovh/service-rtd`
- **Email rattaché** : le tien (`kassongojustin@gmail.com`) — donc en cas de mot de passe oublié, le lien de récupération arrive directement chez toi, pas chez le client.
- **Groupe** : `ADMIN` (droits complets sur les services du compte, dont le nom de domaine).

Pour la maintenance future, connecte-toi directement sur **manager.ovh.com** avec cet identifiant.

## Et la boîte mail support@recuptesdroits.fr ?

Pointer le domaine vers GitHub Pages (étape ci-dessus) ne touche **pas** aux emails : ce sont deux choses différentes (enregistrements A/CNAME pour le site web, enregistrements MX pour les emails). Si une offre email OVH est déjà active sur ce domaine, elle continue de fonctionner normalement. Voir `EMAIL-SETUP.md` pour la mise en place de l'adresse support@recuptesdroits.fr elle-même.
