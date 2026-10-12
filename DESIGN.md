---
name: Récup tes Droits
description: Maquette commerciale — accompagnement création d'entreprise et droits ARCE
colors:
  navy: "#0B1B33"
  navy-deep: "#081425"
  navy-raised: "#122849"
  red: "#D7263D"
  red-dark: "#AD1E31"
  paper: "#F7F5EF"
  paper-dim: "#ECE7D9"
  ink: "#16233D"
  ink-soft: "#4B5568"
typography:
  display:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 1.9rem + 3vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "0.01em"
  body:
    fontFamily: "Public Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "1rem"
    fontWeight: 500
rounded:
  sm: "6px"
  md: "10px"
  lg: "18px"
spacing:
  sm: "0.75rem"
  md: "1.5rem"
  lg: "3rem"
  xl: "6.5rem"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.85em 1.5em"
  button-primary-hover:
    backgroundColor: "{colors.red-dark}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
---

# Design System: Récup tes Droits

## Overview

**Creative North Star : « L'avis officiel »**

Le système s'inspire des avis et tampons officiels — la paperasse administrative elle-même — mais rejoue ce vocabulaire avec confiance plutôt qu'avec anxiété : chaque étape du dossier client devient un avis « papier » proprement épinglé sur un panneau bleu nuit, validé par un tampon rouge plutôt que redouté. Le logo existant du client (un badge rond) a directement inspiré le tampon/sceau à bords festonnés qui ancre toute l'identité.

Le ton reste énergique et direct (hérité de la marque sur Instagram/TikTok : « Ton argent dort, réveille-le »), jamais corporate ou froid — mais toujours lisible et digne de confiance, puisque le service traite de l'argent et des papiers d'identité des visiteurs. Rejets confirmés : pas de dégradés glassmorphism, pas d'illustrations génériques, pas de rayures décoratives en repeating-gradient, pas de fond crème « par défaut ».

**Key Characteristics :**
- Fond bleu nuit dominant (stratégie de couleur « Committed »), jamais de thème clair par défaut.
- Surfaces « papier » blanc cassé réservées aux avis/cartes posés sur le bleu nuit — jamais la couleur de fond de page entière.
- Titres en Anton (capitales condensées) façon tampon ; corps de texte en Public Sans pour rester lisible et civique.
- Un seul geste signature : le sceau/tampon rond (logo), décliné en petit pour les confirmations et accents.

## Colors

Stratégie « Committed » : le bleu nuit porte la majorité de chaque écran, le rouge sert d'accent concentré (CTA, tampons, statuts), le papier n'apparaît que comme surface posée dessus.

### Primary
- **Bleu nuit** (`#0B1B33`) : fond dominant de toutes les pages (marketing, espace client, espace admin). C'est le « panneau » sur lequel les avis sont épinglés.
- **Rouge tampon** (`#D7263D`) : CTA principaux, badge/logo, accents de statut « en cours », soulignement d'emphase dans les titres. Jamais utilisé comme texte de petite taille sur fond bleu nuit (contraste insuffisant) — réservé aux surfaces, formes et gros titres.

### Neutral
- **Papier** (`#F7F5EF`) : surface des avis/notices posés sur le bleu nuit (bloc `.notice`, cartes de preuve) et des pages de lecture longue (mentions légales, CGU). N'est jamais le fond de page entier d'un écran d'application.
- **Encre** (`#16233D`) / **Encre douce** (`#4B5568`) : texte sur surfaces papier/blanches.
- **Blanc sur bleu nuit** (`rgba(247,245,239,.72)` / `1`) : texte sur fond bleu nuit, à deux niveaux d'opacité (texte principal / texte secondaire).

### Named Rules
**La règle du rouge-surface.** Le rouge porte des formes (boutons, badges, tampon) ou de grands titres, jamais du texte de petite taille sur fond bleu nuit — sous peine de tomber sous le seuil de contraste WCAG AA.

## Typography

**Police d'affichage :** Anton (avec Arial Narrow en repli)
**Police de texte courant :** Public Sans
**Police des chiffres clés :** JetBrains Mono, chiffres tabulaires

**Caractère :** Anton apporte l'autorité « tamponnée » du titre officiel ; Public Sans garde le ton civique et lisible nécessaire pour des formulaires et des pages légales. JetBrains Mono isole les chiffres (statistiques, dates, montants) pour une précision assumée.

### Hierarchy
- **H1** (400, clamp 2.5rem→4.25rem, 1.04) : accroche de l'accueil uniquement.
- **H2** (400, clamp 1.875rem→2.75rem) : titres de section.
- **H3** (400, clamp 1.5rem→2.0625rem) : sous-titres de section, cartes de l'espace client/admin (taille réduite à 1.1–1.2rem dans ce contexte précis).
- **Corps** (400, 1.0625rem, 1.55) : texte courant, 60–70ch de mesure maximum.
- **Kicker/label** (Anton, 0.78–0.85rem, majuscules, tracking 0.08em) : étiquettes courtes uniquement — jamais un paragraphe entier en capitales.

Tous les titres (`h1`–`h4`) héritent par défaut d'Anton + majuscules ; les composants qui doivent s'en écarter (rare) le font explicitement, jamais en silence.

## Layout

Conteneur principal à 1180px, padding horizontal 1.5rem (0.75rem sous 620px). Rythme vertical en paliers de 0.5rem à 6.5rem (`--space-1` à `--space-8`). Sections pleine largeur alternent fond bleu nuit et fond papier (`.section--on-paper`) pour respirer. Mobile-first assumé : le header bascule sur une seule action visible sous 620px pour ne jamais déborder horizontalement ; la navigation complète ne s'affiche qu'au-delà de 920px.

## Elevation & Depth

Pas d'ombres décoratives flottantes : la profondeur vient du contraste de surface (papier blanc sur bleu nuit) plutôt que de `box-shadow` visibles partout. Deux ombres fonctionnelles seulement :

### Shadow Vocabulary
- **Ombre papier** (`0 1px 2px rgba(8,20,37,.06), 0 12px 28px rgba(8,20,37,.10)`) : sous chaque carte/avis posé sur fond clair ou bleu nuit, pour suggérer qu'elle est physiquement épinglée dessus.
- **Ombre bleu nuit** (`0 20px 48px rgba(3,9,20,.45)`) : sous les éléments papier qui flottent directement sur le bleu nuit le plus sombre (ex. cartes d'étape du hero), plus marquée pour compenser le fond déjà sombre.

### Named Rules
**La règle de l'épinglage.** Une ombre n'existe que pour faire croire qu'une surface papier est posée sur le panneau bleu nuit — jamais comme simple décoration sur une surface déjà plate.

## Shapes

Coins arrondis modérés et constants : 6px (boutons, champs), 10px (cartes/avis), 18px (grandes cartes d'authentification). Le CTA principal (`.btn--stamp`) utilise un `clip-path` en parallélogramme (languette à arracher) plutôt qu'un simple rectangle arrondi — c'est la seule forme non rectangulaire du système, réservée à l'action de prise de RDV. Le sceau/logo est la seule forme circulaire récurrente (festonné à 12 pointes, cercle intérieur plein).

## Components

### Buttons
- **Forme :** coins à 6px, sauf le CTA « tampon » en parallélogramme.
- **Primaire (`.btn--stamp`) :** fond rouge, texte papier, forme languette — réservé à l'action la plus importante de l'écran (prendre RDV, confirmer).
- **Fantôme (`.btn--ghost`) :** transparent, bordure blanche 40 % d'opacité — action secondaire sur fond bleu nuit.
- **Sur papier (`.btn--on-paper`) :** fond bleu nuit, texte papier — action dans un contexte de carte blanche (ex. envoyer un message).

### Chips (statuts)
- **Dossier :** `attente` (ambre sur fond ambre sombre), `en_cours` (bleu clair sur fond bleu sombre), `termine` (vert sur fond vert sombre) — jamais le rouge de marque, pour ne pas confondre un statut avec un CTA.
- **Exemple :** fond neutre tramé, bordure pointillée — signale tout contenu de démonstration (avis, témoignages) non destiné à rester tel quel.

### Cards / Containers (`.notice`)
- **Coins :** 10px.
- **Fond :** papier, avec une petite languette rouge en haut à gauche (`::before`) qui simule une épingle.
- **Ombre :** voir Elevation & Depth.
- **Padding interne :** 2rem (`--space-5`).

### Inputs / Fields
- **Style :** fond blanc, bordure 1.5px encre à 20 % d'opacité, coins 6px.
- **Focus :** bordure rouge pleine (pas de glow), cohérent avec le `outline` rouge global du site.
- **Erreur :** bordure rouge foncé + message inline sous le champ (jamais une alerte native `alert()`).

### Navigation
- Header sombre sticky, logo + libellé à gauche, nav texte (poids 600) au centre, actions à droite. Variante « app » (espace client/admin) : logo seul + une action de sortie, sans nav marketing — l'Operate reste dense et sans distraction commerciale.

### Tampon / sceau (signature)
Badge rond festonné à 12 pointes (rouge), disque bleu nuit par-dessus, coche blanche épaisse au centre. Utilisé comme logo, favicon, et à plus grande échelle comme confirmation visuelle (écran de succès de prise de RDV). C'est l'unique forme organique du système — tout le reste est rectangulaire ou en languette.

## Do's and Don'ts

### Do :
- **Do** garder le bleu nuit comme fond de page par défaut sur tout le site, y compris l'espace client/admin — le papier est une surface posée dessus, jamais le fond lui-même.
- **Do** réserver Anton + majuscules aux titres et étiquettes courtes ; jamais à un paragraphe entier.
- **Do** étiqueter tout contenu de démonstration (avis, témoignages vidéo) avec le badge « Exemple ».
- **Do** utiliser les chemins racine (`/assets/...`) et servir le site via `python3 -m http.server`, jamais en `file://` (le `localStorage` partagé entre pages en dépend).

### Don't :
- **Don't** utiliser le rouge de marque comme couleur de texte de petite taille sur fond bleu nuit (contraste insuffisant — préférer une forme/fond rouge, ou souligner en rouge un texte resté blanc).
- **Don't** ajouter de rayures décoratives en `repeating-gradient` ou autre texture générique « IA » — un dégradé simple ou une surface plane suffit.
- **Don't** inventer un prix, un délai garanti ou un avis client réel : tout ce qui n'est pas vérifié reste explicitement un exemple ou un placeholder « à compléter ».
