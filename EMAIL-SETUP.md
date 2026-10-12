# Email de notification client — mise en place

Objectif : quand tu réponds à un client dans la messagerie (espace admin → fiche client → onglet Messages), il reçoit un email l'informant qu'il a une réponse, envoyé depuis **support@recuptesdroits.fr**.

Le site n'ayant pas de serveur, l'envoi passe par **EmailJS** (gratuit jusqu'à 200 emails/mois, aucune ligne de code à écrire côté serveur). Le code est déjà en place dans le site — il ne manque que 2 choses que je ne peux pas faire à ta place : créer le compte EmailJS, et donner accès à la boîte mail support@recuptesdroits.fr.

## Étape 1 — Créer la boîte mail support@recuptesdroits.fr (chez OVH)

1. Connecte-toi sur **manager.ovh.com**, va dans la section **« Emails »** du nom de domaine `recuptesdroits.fr`.
2. Si aucune offre email n'est active, active l'offre gratuite incluse (« MX Plan ») ou une offre payante selon ce qui est proposé.
3. Crée une adresse **support@recuptesdroits.fr** avec un mot de passe (note-le, il sert à l'étape 3).
4. Note aussi les informations **SMTP** d'OVH (généralement affichées dans la fiche de la boîte mail, ou dans la doc OVH « Paramètres SMTP/IMAP ») : serveur `ssl0.ovh.net`, port `465` (SSL) — à confirmer sur la page OVH de la boîte mail, ça peut varier légèrement.

## Étape 2 — Créer le compte EmailJS

1. Va sur **https://www.emailjs.com/** → « Sign Up » (gratuit).
2. Une fois connecté, va dans **Email Services** → **Add New Email Service** → choisis **« Other »** (SMTP personnalisé).
3. Renseigne les informations SMTP d'OVH de l'étape 1 (adresse support@recuptesdroits.fr, mot de passe, serveur, port).
4. Note le **Service ID** généré (ex. `service_xxxxxxx`).

## Étape 3 — Créer le modèle d'email (template)

1. Dans EmailJS, va dans **Email Templates** → **Create New Template**.
2. Dans le champ "To Email", mets `{{to_email}}`.
3. Dans le sujet, écris par exemple : `Nouvelle réponse de Récup tes Droits`.
4. Dans le corps du message, écris quelque chose comme :
   ```
   Bonjour {{to_name}},

   Tu as reçu une nouvelle réponse dans ton espace client Récup tes Droits :

   "{{message}}"

   Connecte-toi à ton espace client pour voir la conversation complète et répondre.

   — Récup tes Droits
   ```
5. Enregistre, et note le **Template ID** généré (ex. `template_xxxxxxx`).

## Étape 4 — Récupérer la clé publique

Dans EmailJS, va dans **Account** → **General** → copie la **Public Key**.

## Étape 5 — Renseigner les 3 informations dans le site

Ouvre le fichier `assets/js/email-config.js` et remplace :

```js
window.RTD_EMAIL_CONFIG = {
  enabled: true,
  publicKey: "colle ta Public Key ici",
  serviceId: "colle ton Service ID ici",
  templateId: "colle ton Template ID ici"
};
```

(Le passage de `enabled: false` à `enabled: true` est ce qui active réellement l'envoi.)

## Étape 6 — Tester

1. Enregistre le fichier, relance le serveur local si besoin (`python3 serve.py 8770`).
2. Crée un espace client de test, envoie un message depuis cet espace.
3. Dans l'espace admin, réponds à ce message.
4. Vérifie que l'email de test arrive bien à l'adresse du compte client utilisé.

Si rien n'arrive : vérifie dans la console du navigateur (clic droit → Inspecter → Console) s'il y a un message d'erreur — il indique généralement si c'est un problème de clé, de SMTP, ou de quota.
