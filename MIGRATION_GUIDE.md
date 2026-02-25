# Guide de Migration - Mise à jour de la base de données

## ⚠️ Important : La migration se fait AUTOMATIQUEMENT

Le fichier `vercel.json` contient déjà :
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

Cela signifie que **chaque redeploy** exécute automatiquement les migrations.

---

## 🚀 Comment mettre à jour votre app

### Étape 1 : Poussez les modifications sur GitHub

1. Allez sur votre repo GitHub
2. Uploadez les fichiers modifiés :
   - `prisma/schema.prisma` (avec le champ `partnerStatus`)
   - `src/app/api/leads/[id]/research/route.ts` (filtre mis à jour)
   - `scripts/import-timers.ts` (script d'import)
   - `scripts/README_IMPORT.md` (documentation)

### Étape 2 : Redeploy sur Vercel

1. Allez sur https://vercel.com
2. Cliquez sur votre projet
3. Cliquez sur **"Redeploy"** (bouton en haut à droite)
4. Attendez que le déploiement se termine

**La migration se fait automatiquement pendant le build !**

---

## ✅ Vérifier que la migration a fonctionné

### Option 1 : Via l'admin

1. Allez sur : `https://votre-app.vercel.app/admin?token=VOTRE_TOKEN`
2. Vérifiez que tout fonctionne

### Option 2 : Via Prisma Studio

Si vous avez accès à un terminal avec la DATABASE_URL :

```bash
export DATABASE_URL="votre_url_railway"
npx prisma studio
```

Puis vérifiez que la table `Timer` a bien la colonne `partnerStatus`.

---

## 📥 Importer vos timers

### Option recommandée : Endpoint API (le plus simple)

1. Allez sur cette URL dans votre navigateur :
   ```
   https://votre-app.vercel.app/api/admin/import-timers
   ```

2. Ouvrez la console développeur (F12) → onglet **"Console"**

3. Collez ce code et appuyez sur Entrée :
   ```javascript
   fetch('/api/admin/import-timers', {
     method: 'POST',
     headers: {
       'authorization': 'Bearer VOTRE_ADMIN_TOKEN'
     }
   })
   .then(r => r.json())
   .then(data => console.log(data))
   ```

4. Remplacez `VOTRE_ADMIN_TOKEN` par votre vrai token

5. Vous verrez le résultat dans la console :
   ```
   {
     success: true,
     imported: 85,
     skipped: 0,
     errors: 0,
     results: [...]
   }
   ```

### Option alternative : curl

Dans votre terminal :
```bash
curl -X POST https://votre-app.vercel.app/api/admin/import-timers \
  -H "authorization: Bearer VOTRE_ADMIN_TOKEN"
```

---

## 📝 Résumé des changements

| Fichier | Changement |
|---------|------------|
| `prisma/schema.prisma` | Ajout du champ `partnerStatus` |
| `src/app/api/leads/[id]/research/route.ts` | Filtre : exclut seulement "Refused" |
| `scripts/import-timers.ts` | Script avec vos 130+ timers |

---

## ❓ Problèmes courants

### "Column partnerStatus does not exist"

La migration n'a pas été exécutée. Redeployez l'app.

### "Cannot find module '@prisma/client'"

Exécutez `npm install` puis `npx prisma generate`.

---

**Besoin d'aide ? Envoyez-moi l'erreur exacte.**

# Test deployment - force rebuild
