# Email de notification client — mise en place

Objectif : quand tu réponds à un client dans la messagerie (espace admin → fiche client → onglet Messages), il reçoit un email l'informant qu'il a une réponse.

Le site n'ayant pas de serveur, l'envoi passe par **EmailJS** (gratuit jusqu'à 200 emails/mois, aucune ligne de code à écrire côté serveur). Le code est déjà en place dans le site.

## Pourquoi Gmail et pas la boîte OVH

L'email réellement utilisé au quotidien, c'est **recuptesdroits@gmail.com** — pas la boîte `support@recuptesdroits.fr` que j'avais créée sur OVH par défaut. Du coup on envoie directement avec ce Gmail : EmailJS a un connecteur Gmail intégré, plus simple qu'une config SMTP (une simple autorisation Google, aucun mot de passe à donner nulle part).

La boîte `support@recuptesdroits.fr` créée sur OVH (mot de passe `RtdSupport!2026#Mail`) reste disponible si besoin plus tard, mais elle n'est plus nécessaire pour cette fonctionnalité — tu peux l'ignorer.

Les emails envoyés aux clients apparaîtront comme venant de **recuptesdroits@gmail.com**. Si tu préfères qu'ils apparaissent comme venant de `support@recuptesdroits.fr` plus tard, on pourra reprendre la boîte OVH à ce moment-là.

## Étape 1 — Créer le compte EmailJS

1. Va sur **https://www.emailjs.com/** → « Sign Up » (gratuit). C'est à toi de le faire, je n'ai pas le droit de créer des comptes tiers à ta place.
2. Une fois connecté, va dans **Email Services** → **Add New Email Service** → choisis **« Gmail »** (dans la liste des services, pas « Other »).
3. Clique sur **« Connect Account »** et connecte-toi avec **recuptesdroits@gmail.com** — Google demande une autorisation (écran Google classique), pas de mot de passe à saisir dans EmailJS.
4. Note le **Service ID** généré (ex. `service_xxxxxxx`).

## Étape 2 — Créer le modèle d'email (template)

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

## Étape 3 — Récupérer la clé publique

Dans EmailJS, va dans **Account** → **General** → copie la **Public Key**.

## Étape 4 — Renseigner les 3 informations dans le site

Donne-moi les 3 valeurs (Service ID, Template ID, Public Key) et je les mets directement dans `assets/js/email-config.js`, ou fais-le toi-même :

```js
window.RTD_EMAIL_CONFIG = {
  enabled: true,
  publicKey: "colle ta Public Key ici",
  serviceId: "colle ton Service ID ici",
  templateId: "colle ton Template ID ici"
};
```

(Le passage de `enabled: false` à `enabled: true` est ce qui active réellement l'envoi.)

## Étape 5 — Tester

1. Enregistre le fichier, relance le serveur local si besoin (`python3 serve.py 8770`).
2. Crée un espace client de test, envoie un message depuis cet espace.
3. Dans l'espace admin, réponds à ce message.
4. Vérifie que l'email de test arrive bien à l'adresse du compte client utilisé.

Si rien n'arrive : vérifie dans la console du navigateur (clic droit → Inspecter → Console) s'il y a un message d'erreur — il indique généralement si c'est un problème de clé, de connexion Gmail, ou de quota.
