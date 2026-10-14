# Guide couleurs — pour les nuls (pas d'offense, c'est pour que ce soit facile)

Ce guide t'explique comment changer les couleurs du site **toi-même**, sans savoir coder. Prends ton temps, chaque étape est détaillée.

## C'est quoi un "code couleur" ?

Sur ordinateur, une couleur s'écrit avec un **#** suivi de 6 lettres/chiffres. Exemple : `#D7263D` c'est le rouge du site.

Tu n'as pas besoin de comprendre comment ça marche. Tu as juste besoin d'un site qui te donne ce code quand tu choisis une couleur avec la souris :

👉 Va sur **https://htmlcolorcodes.com/color-picker/**, clique n'importe où dans le grand carré de couleurs jusqu'à trouver celle que tu veux, et regarde la case **"HEX"** en haut — c'est ce code (les 6 lettres/chiffres après le #) qu'il te faut copier.

## Étape par étape

### 1. Ouvre le bon fichier

Dans le dossier du site, va dans `assets` puis `css`, et ouvre le fichier **`style.css`** avec un simple éditeur de texte (le Bloc-notes/TextEdit suffit, ou l'application que tu utilises déjà pour ce projet).

### 2. Trouve le bloc des couleurs

Tout en haut du fichier, dans les 15-20 premières lignes, tu vas voir un bloc qui ressemble à ça :

```css
:root {
  /* Couleurs de marque */
  --navy:        #0B1B33;
  --navy-deep:   #081425;
  --navy-raised: #122849;
  --blue:        #4FC3DC;
  --blue-deep:   #15647C;
  --red:         #D7263D;
  --red-dark:    #AD1E31;
  --paper:       #F7F5EF;
  --paper-dim:   #ECE7D9;
  ...
```

**C'est le SEUL endroit où tu dois toucher.** Chaque ligne = une couleur. Le tableau ci-dessous t'explique à quoi sert chacune.

### 3. Change UNE couleur à la fois

Repère la ligne de la couleur à changer (tableau plus bas), et remplace le code après le `#` par ton nouveau code. Exemple, pour changer le rouge :

Avant : `  --red:         #D7263D;`
Après : `  --red:         #FF4D5E;`

**Ne touche à rien d'autre sur la ligne** (pas le `--red:`, pas le `;` à la fin).

### 4. Enregistre, puis regarde le résultat

Enregistre le fichier (Cmd+S), puis va dans ton navigateur sur le site (`http://localhost:8770` si tu testes en local, ou directement sur `jkii357.github.io/recup-tes-droits/` si tu as déjà poussé les changements) et **actualise la page** (Cmd+R). Le changement doit apparaître tout de suite.

Si rien ne change : vérifie que tu as bien gardé le `#`, le `;` à la fin, et que tu n'as pas effacé une ligne par erreur.

### 5. Recommence pour chaque couleur

Une couleur à la fois, en revérifiant à chaque fois dans le navigateur. C'est plus lent, mais tu ne te perds jamais et tu peux annuler facilement si un essai ne te plaît pas (remets juste l'ancien code).

## Quelle ligne contrôle quoi ?

| Ligne dans le fichier | Ce que ça change sur le site |
|---|---|
| `--navy` | Le fond bleu nuit principal (header, fond de page, footer) |
| `--navy-deep` | Le bleu encore plus foncé (bas du footer) |
| `--navy-raised` | Le bleu un peu plus clair (dégradés, survol de boutons) |
| `--blue` | Le bleu cyan du logo (dégradés du header/footer, halo autour du logo) |
| `--blue-deep` | Le bleu cyan plus foncé, pour la transition des dégradés |
| `--red` | Le rouge principal (bouton "Prendre rendez-vous", logo, accents) |
| `--red-dark` | Le rouge plus foncé (quand on survole un bouton rouge avec la souris) |
| `--paper` | Le blanc cassé des fiches/avis posés sur le fond bleu |
| `--paper-dim` | Un blanc cassé légèrement plus grisé (fonds de lignes dans les tableaux admin) |
| `--ink` | La couleur du texte sur fond blanc (dans les fiches, formulaires) |
| `--ink-soft` | Le gris plus clair pour le texte secondaire sur fond blanc |

## Pour les dégradés (l'effet "plus dégradé" que tu as demandé)

Un peu plus bas dans le même bloc `:root`, tu trouveras 6 lignes qui commencent par `--navy-gradient`, `--header-gradient`, `--footer-gradient`, `--red-gradient`, `--navy-btn-gradient`, `--blue-gradient`. Le header et le footer utilisent maintenant `--blue-deep` au départ du dégradé pour reprendre le bleu du logo. Elles ressemblent à ça :

```css
--red-gradient: linear-gradient(135deg, #E0384D 0%, var(--red) 45%, var(--red-dark) 100%);
```

C'est un dégradé entre 3 couleurs. Tu peux changer les codes `#E0384D` directement (c'est la couleur de départ du dégradé), ou plus simple : laisse ces lignes tranquilles et contente-toi de changer `--red` et `--red-dark` plus haut — les dégradés se mettront à jour automatiquement puisqu'ils les réutilisent (c'est écrit `var(--red)` dedans, ça veut dire "prends la couleur rouge définie plus haut").

## Les 3 couleurs de statut (à ne toucher qu'avec précaution)

Un peu plus bas, tu verras aussi des couleurs pour les statuts de dossier (attente/en cours/terminé) et les documents. Je te conseille de **ne pas y toucher** : ce sont des couleurs qui ont un sens précis (ambre = en attente, bleu = en cours, vert = terminé) que les clients et toi apprenez à reconnaître d'un coup d'œil. Changer leur sens pourrait rendre le site confus à utiliser.

## Si tu casses quelque chose

Pas de panique : dans Claude Code, tu peux toujours me redonner la main en me disant "remets les couleurs comme avant" ou en me décrivant ce que tu voulais — je peux reprendre à tout moment. Rien n'est jamais perdu.
