# Guide de Déploiement - Miles Timer App

**Date : 24 février 2026**  
**Version : 1.0**

---

## 📋 Vue d'ensemble

Cette application est composée de :
1. **Frontend** : Pages web (admin + portail chrono)
2. **Backend** : API pour gérer les données
3. **Base de données** : PostgreSQL pour stocker les leads et timers
4. **Emails** : Resend pour envoyer les emails

---

## 🛠️ Ce dont vous avez besoin

### 1. Compte Railway (Base de données) - GRATUIT
- Allez sur https://railway.app
- Créez un compte avec GitHub ou email
- Coût : **0€** (500 Mo gratuits)

### 2. Compte Resend (Emails) - GRATUIT
- Allez sur https://resend.com
- Créez un compte
- Coût : **0€** (3 000 emails/jour gratuits)

### 3. Compte Vercel (Hébergement) - GRATUIT
- Allez sur https://vercel.com
- Créez un compte avec GitHub
- Coût : **0€**

### 4. Compte GitHub (pour le code)
- Allez sur https://github.com
- Créez un compte si vous n'en avez pas
- Coût : **0€** (repo privé gratuit)

**Total : 0€**

---

## ÉTAPE 1 : Créer la base de données Railway (5 min)

1. Allez sur https://railway.app/dashboard
2. Cliquez sur le bouton **"New"** (en haut à droite)
3. Sélectionnez **"Database"**
4. Sélectionnez **"Add PostgreSQL"**
5. Attendez quelques secondes que la base soit créée
6. Cliquez sur la base de données créée
7. Allez dans l'onglet **"Connect"**
8. Copiez l'URL **"Database URL"**
   - Elle ressemble à : `postgresql://user:password@host:5432/railway`
9. **Gardez cette URL précieusement !** (vous en aurez besoin à l'étape 4)

---

## ÉTAPE 2 : Créer un compte Resend (3 min)

1. Allez sur https://resend.com
2. Cliquez sur **"Sign Up"**
3. Créez un compte avec votre email
4. Une fois connecté, allez dans **"API Keys"** (dans le menu de gauche)
5. Cliquez sur **"Create API Key"**
6. Nommez-la : `Miles Timer App`
7. Cliquez sur **"Create"**
8. **Copiez la clé API** (elle commence par `re_`)
9. **Gardez cette clé précieusement !** (vous en aurez besoin à l'étape 4)

**Note** : Vous pouvez utiliser le domaine de test de Resend (`onboarding@resend.dev`) pour les emails, pas besoin de vérifier votre domaine pour le POC.

---

## ÉTAPE 3 : Mettre le code sur GitHub (5 min)

### Option A : Interface web (plus simple)

1. Allez sur https://github.com
2. Connectez-vous
3. Cliquez sur le **+** (en haut à droite) → **"New repository"**
4. Nommez-le : `miles-timer-app`
5. Choisissez **"Private"** (privé)
6. Cliquez sur **"Create repository"**
7. Sur la page suivante, cherchez **"uploading an existing file"**
8. Glissez-déposez TOUS les fichiers du dossier `MILES-TIMER-APP-2026-02-24`
9. Cliquez sur **"Commit changes"**

### Option B : Ligne de commande (si vous savez utiliser git)

```bash
cd MILES-TIMER-APP-2026-02-24
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/miles-timer-app.git
git push -u origin main
```

---

## ÉTAPE 4 : Déployer sur Vercel (10 min)

1. Allez sur https://vercel.com
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur **"Add New Project"**
4. Importez votre repo `miles-timer-app`
5. Sur la page de configuration :
   - **Framework Preset** : Next.js (déjà sélectionné)
   - **Root Directory** : `./` (laissez par défaut)

6. Déroulez **"Environment Variables"** et ajoutez :

| Nom | Valeur | Description |
|-----|--------|-------------|
| `DATABASE_URL` | `postgresql://...` | Votre URL Railway (étape 1) |
| `APP_URL` | `https://votre-app.vercel.app` | Votre URL Vercel (vous la verrez après le déploiement) |
| `WEBHOOK_SECRET` | `un-mot-de-passe-aleatoire` | Un mot de passe que vous choisissez |
| `ADMIN_TOKEN` | `un-autre-mot-de-passe-aleatoire` | Un autre mot de passe que vous choisissez |
| `RESEND_API_KEY` | `re_...` | Votre clé Resend (étape 2) |
| `FROM_EMAIL` | `Miles Republic <devis@milesrepublic.com>` | L'adresse d'envoi |

**Pour générer des mots de passe aléatoires**, vous pouvez utiliser : https://passwordsgenerator.net

7. Cliquez sur **"Deploy"**
8. Attendez 2-3 minutes que le déploiement se fasse
9. **Copiez l'URL de votre app** (ex: `https://miles-timer-app-xxx.vercel.app`)
10. **Mettez à jour la variable `APP_URL`** avec cette URL dans les paramètres Vercel :
    - Allez dans **"Settings"** → **"Environment Variables"**
    - Modifiez `APP_URL`
    - Cliquez sur **"Save"**
    - Cliquez sur **"Redeploy"**

---

## ÉTAPE 5 : Créer les tables dans la base de données (2 min)

1. Sur Vercel, allez dans votre projet
2. Cliquez sur l'onglet **"Console"**
3. Tapez cette commande et appuyez sur Entrée :
   ```
   npx prisma migrate deploy
   ```
4. Attendez que la commande se termine (vous verrez "Database schema created")
5. **Les tables sont créées !**

---

## ÉTAPE 6 : Ajouter vos chronométreurs (10 min)

### Option A : Via l'API (recommandé pour plusieurs timers)

Vous pouvez créer un script pour ajouter tous vos timers d'un coup.

Exemple avec curl (à faire dans votre terminal) :

```bash
curl -X POST https://VOTRE-APP.vercel.app/api/timers \
  -H "authorization: Bearer VOTRE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chronosport",
    "companyName": "Chronosport SAS",
    "email": "contact@chronosport.fr",
    "phone": "+33612345678",
    "postcode": "75001"
  }'
```

Répétez pour chaque timer.

### Option B : Via Prisma Studio (interface graphique)

1. En local (sur votre ordinateur) :
   ```bash
   npx prisma studio
   ```
   Ou sur Vercel Console :
   ```
   npx prisma studio
   ```
2. Une interface web s'ouvre
3. Cliquez sur **"Timer"**
4. Cliquez sur **"Add Record"**
5. Remplissez les champs :
   - `name` : Nom du chrono
   - `companyName` : Nom de la société (optionnel)
   - `email` : Email du chrono
   - `phone` : Téléphone (optionnel)
   - `postcode` : Code postal
   - `lat` et `lng` : Laissez vide, l'app les remplira automatiquement
   - `isActive` : `true`
6. Cliquez sur **"Save 1 Record"**
7. Répétez pour chaque timer

**Important** : Chaque timer reçoit automatiquement un `accessToken` unique. C'est son lien d'accès au portail.

---

## ÉTAPE 7 : Connecter Tally avec Make.com (15 min)

### Scénario 1 : Tally → Votre App

1. Allez sur https://make.com
2. Créez un nouveau scénario
3. Ajoutez le module **Tally** → "Watch New Submissions"
4. Connectez votre compte Tally
5. Sélectionnez votre formulaire de devis chrono
6. Ajoutez le module **HTTP** → "Make a Request"
7. Configurez :
   - **URL** : `https://VOTRE-APP.vercel.app/api/webhooks/tally`
   - **Method** : POST
   - **Headers** :
     - `Content-Type` : `application/json`
     - `x-webhook-secret` : `VOTRE_WEBHOOK_SECRET`
   - **Body** (type: Raw, Content type: JSON) :
     ```json
     {
       "eventDate": "{{1.event_date}}",
       "eventName": "{{1.event_name}}",
       "city": "{{1.city}}",
       "postcode": "{{1.postcode}}",
       "participants": "{{1.participants}}",
       "discipline": "{{1.discipline}}",
       "organizerName": "{{1.organizer_name}}",
       "organizerEmail": "{{1.organizer_email}}",
       "organizerPhone": "{{1.organizer_phone}}",
       "notes": "{{1.notes}}"
     }
     ```
8. Activez le scénario

---

## ÉTAPE 8 : Tester (10 min)

1. **Soumettez un test** via votre formulaire Tally
2. **Vérifiez** que le lead apparaît dans l'admin :
   - Allez sur `https://VOTRE-APP.vercel.app/admin?token=VOTRE_ADMIN_TOKEN`
3. **Cliquez** sur "Lancer recherche"
4. **Vérifiez** que les emails sont envoyés :
   - Allez sur https://resend.com → "Logs"
5. **Cliquez** sur le lien "Je suis dispo" dans l'email
6. **Vérifiez** que le statut se met à jour dans l'admin
7. **Vérifiez** que l'organisateur reçoit l'email d'introduction

---

## 🔗 URLs importantes après déploiement

| Page | URL |
|------|-----|
| Accueil | `https://votre-app.vercel.app` |
| Admin | `https://votre-app.vercel.app/admin?token=VOTRE_ADMIN_TOKEN` |
| Portail chrono | `https://votre-app.vercel.app/chrono/ACCESS_TOKEN` |

---

## 🆘 Problèmes courants

### "Unauthorized" sur l'admin
- Vérifiez que vous avez bien `?token=VOTRE_ADMIN_TOKEN` dans l'URL

### Les emails ne partent pas
- Vérifiez la clé Resend dans les variables d'environnement Vercel
- Vérifiez les logs Resend (https://resend.com → Logs)
- Vérifiez que l'adresse `FROM_EMAIL` est correcte

### Aucun chrono trouvé
- Vérifiez que les chronos ont bien un code postal
- Vérifiez qu'ils sont `isActive: true`
- Vérifiez que l'événement est dans un rayon de 300 km

### "Database connection error"
- Vérifiez que l'URL `DATABASE_URL` est correcte dans Vercel
- Vérifiez que la base Railway est bien démarrée

---

## 📞 Support

En cas de problème, envoyez-moi :
1. L'erreur exacte (copier-coller)
2. Les logs Vercel (Console → Logs)
3. Ce que vous avez essayé

---

**Félicitations ! Votre app est déployée !** 🎉
