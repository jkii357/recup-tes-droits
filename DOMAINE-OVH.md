# Connecter le nom de domaine OVH (recuptesdroits.fr) au site

Le site est hébergé sur GitHub Pages (**https://jkii357.github.io/recup-tes-droits/**). Pour qu'il réponde sur **recuptesdroits.fr**, il faut dire à OVH où envoyer les visiteurs (ça, c'est toi/ton client qui le fait, je n'ai pas accès à son compte OVH) — le reste, je l'ai déjà préparé côté GitHub.

## Ce que j'ai déjà fait

- Ajouté un fichier `CNAME` à la racine du site contenant `recuptesdroits.fr` (c'est ce qui dit à GitHub Pages "sers ce site aussi sur ce domaine").
- Je vais renseigner `recuptesdroits.fr` dans les réglages GitHub Pages du dépôt.

## Ce qu'il reste à faire chez OVH (par toi ou ton client)

1. Connecte-toi sur **manager.ovh.com**, va dans **Noms de domaine → recuptesdroits.fr → Zone DNS**.
2. Ajoute ces 4 enregistrements de type **A** (ils pointent le domaine nu `recuptesdroits.fr` vers les serveurs de GitHub) :

   | Type | Sous-domaine | Cible |
   |---|---|---|
   | A | (laisser vide / @) | 185.199.108.153 |
   | A | (laisser vide / @) | 185.199.109.153 |
   | A | (laisser vide / @) | 185.199.110.153 |
   | A | (laisser vide / @) | 185.199.111.153 |

3. Ajoute aussi un enregistrement **CNAME** pour que `www.recuptesdroits.fr` fonctionne aussi :

   | Type | Sous-domaine | Cible |
   |---|---|---|
   | CNAME | www | jkii357.github.io. |

4. Si des enregistrements A ou CNAME existent déjà sur `recuptesdroits.fr` (souvent mis par défaut par OVH, ex. vers une page de parking), **supprime-les** avant d'ajouter les nouveaux — sinon ça entre en conflit.
5. Enregistre. La propagation DNS prend entre quelques minutes et 24h (en général moins d'une heure).

## Vérifier que ça marche

Une fois la propagation faite, va sur `https://recuptesdroits.fr` — le site doit s'afficher. Dis-le-moi, j'irai alors activer **« Enforce HTTPS »** dans les réglages GitHub Pages (certificat gratuit automatique, GitHub ne peut l'activer qu'une fois le DNS détecté correctement).

## Et la boîte mail support@recuptesdroits.fr ?

Pointer le domaine vers GitHub Pages (étape ci-dessus) ne touche **pas** aux emails : ce sont deux choses différentes (enregistrements A/CNAME pour le site web, enregistrements MX pour les emails). Si une offre email OVH est déjà active sur ce domaine, elle continue de fonctionner normalement. Voir `EMAIL-SETUP.md` pour la mise en place de l'adresse support@recuptesdroits.fr elle-même.
