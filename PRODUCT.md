# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML / CSS / JS, zero build. Décidé via le plan d'implémentation approuvé par l'utilisateur, en continuité avec la convention établie sur les autres sites clients du même porteur de projet (voir `/Users/justin/Desktop/CODE SITES/` : AUDITHERM, WILLEMOT, PERNET SAS...).

## Users

Utilisateur principal : demandeur d'emploi français qui veut créer son entreprise et récupérer ses droits ARCE restants. Il navigue des démarches administratives multi-étapes qu'il ne maîtrise pas (création INPI, demande ACRE auprès de l'URSSAF, déblocage ARCE auprès de France Travail), avec de l'incertitude et un enjeu financier direct.

Utilisateur secondaire : le porteur du service lui-même (l'auto-entrepreneur), qui a besoin d'un espace admin pour piloter les rendez-vous, le dossier de chaque client, la messagerie et les documents reçus.

## Product Purpose

Récup tes Droits est un accompagnement intégral, fait pour le client : le porteur du service gère personnellement la création de l'entreprise via l'INPI, la demande d'ACRE auprès de l'URSSAF, puis le suivi jusqu'au déblocage des fonds ARCE par France Travail. Succès = entreprise créée, ACRE accordée, ARCE versée — avec le minimum de charge administrative pour le client.

## Positioning

Prise en charge de bout en bout des trois démarches liées (INPI + ACRE/URSSAF + ARCE) par une seule personne responsable, face à l'alternative : le faire seul, ou s'adresser à des services génériques de création d'entreprise qui ne sont pas spécialisés sur le parcours de conversion ARCE pour demandeurs d'emploi.

## Operating Context

Service délivré à distance, partout en France — téléphone/visio/email, pas de boutique physique (confirmé avec l'utilisateur). L'acquisition se fait aujourd'hui via des vidéos courtes (Instagram, TikTok), ton direct et énergique ; aucun site web ni fiche Google Business Profile n'existe à ce jour. Le premier contact est un appel téléphonique (prise de RDV), suivi d'une collecte de documents et d'un suivi multi-étapes par client.

## Capabilities and Constraints

- Aucun vrai backend : ceci est une maquette commerciale, pas un site en production. Interactivité décidée : les formulaires publics persistent via `localStorage` (navigateur), l'admin lit/gère ces données en direct, aucune sécurité serveur réelle.
- L'admin fixe manuellement, par client, le statut de 3 catégories fixes (INPI, ACRE, ARCE), chacune valant attente / en cours / terminé.
- Messagerie simple par client (client ↔ porteur du service), un fil par client.
- Dépôt de documents côté client (liste de départ : pièce d'identité, justificatif de domicile — volontairement extensible, d'autres types seront précisés plus tard).
- Pas de compte Calendly réel pour l'instant — le widget de prise de RDV est une maquette visuelle/fonctionnelle, pas un vrai embed.
- Pas de fiche Google Business Profile — l'assistant ne peut pas la créer lui-même (création de compte externe) ; le site prévoit un emplacement « Avis Google » en placeholder, et un guide séparé est fourni pour que le porteur la crée.
- Le fondateur reste non nommé / marque seule dans cette version (confirmé).
- Zone de service : toute la France, à distance (confirmé) — pas d'adresse physique à afficher.

## Brand Commitments

- Nom : « Récup tes Droits ». Instagram @recuptesdroits, TikTok @recuptesdroits.
- Tagline confirmée, vérifiée en direct sur les deux profils : « Ton argent dort 💤, réveille-le 💵 ».
- Ton : direct, énergique, informel, accessible — pas corporate/rigide. Accroches type « Tu touches le chômage ? » sur les réseaux.
- Référence visuelle existante (non réutilisée telle quelle) : logo en badge rond, fond bleu nuit, accents rouge et blanc, lettrage gras, personnage illustré. Le nouveau logo s'en inspire sans copier l'image Instagram.

## Evidence on Hand

- Preuve sociale réelle, vérifiée en direct : Instagram 381 abonnés, TikTok 12,6K abonnés / 60,8K likes (à rafraîchir avant toute vraie présentation, ces chiffres évoluent vite).
- Aucun vrai avis client ni témoignage vidéo à ce jour — le site doit utiliser du contenu d'exemple clairement étiqueté, jamais du contenu inventé présenté comme réel.
- Aucune coordonnée réelle connue (téléphone/email) — placeholders uniquement, à remplacer avant toute mise en ligne réelle.
- Aucun compte Calendly réel, aucune fiche Google Business Profile réelle — absences confirmées à ce jour.

## Product Principles

1. Honnêteté visible sur tout ce qui est placeholder (bannière maquette, avis d'exemple, témoignages vidéo à venir, pages légales) — jamais de contenu inventé présenté comme réel.
2. Une seule personne porte tout le service — le produit doit se lire comme personnellement responsable et rassurant, pas comme une plateforme bureaucratique anonyme, tout en restant marque seule (sans prénom) dans cette version.
3. À distance et national par défaut — les contenus et parcours supposent téléphone/visio/email, jamais une visite physique.
4. L'admin garde le contrôle manuel complet du statut de dossier et des documents de chaque client — service accompagné, pas un tracker en libre-service.
5. Tout ce qui est sensible (date de naissance, téléphone, pièces d'identité) est traité avec un soin visible (cases de consentement, mentions explicites de stockage de démo) même si la vraie sécurité est hors du périmètre de cette maquette.

## Accessibility & Inclusion

Aucune exigence spécifique au produit au-delà des bonnes pratiques générales déjà actées dans le plan approuvé : navigation clavier, contrastes vérifiés, zéro débordement horizontal sur mobile.
