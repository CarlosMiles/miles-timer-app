# Import des Timers - Guide

## 📥 Comment importer vos timers

### Étape 1 : Mettre à jour la base de données

Après avoir modifié le schéma (ajout du champ `partnerStatus`), vous devez recréer les tables :

```bash
# Sur Vercel Console (ou en local)
npx prisma migrate dev --name add_partner_status
```

Ou si vous préférez tout recréer proprement :
```bash
# ATTENTION : Cela supprime toutes les données !
npx prisma migrate reset
```

### Étape 2 : Modifier le fichier d'import

Ouvrez `scripts/import-timers.ts` et modifiez le tableau `timers` avec vos données.

**Format attendu :**
```typescript
const timers = [
  { 
    name: "Nom du timer", 
    email: "email@example.com", 
    phone: "33612345678", 
    postcode: "75001", 
    lat: 48.8566, 
    lng: 2.3522, 
    status: "Partner – High Coverage" 
  },
  // ... autres timers
];
```

### Étape 3 : Exécuter l'import

#### Option A : Sur Vercel Console (recommandé)

1. Allez sur votre projet Vercel
2. Onglet **"Logs"** → Cliquez sur **"Shell"** (icône terminal)
3. Exécutez :
   ```bash
   npx ts-node scripts/import-timers.ts
   ```

#### Option B : En local

1. Sur votre ordinateur, dans le dossier du projet :
   ```bash
   export DATABASE_URL="votre_url_railway"
   npx ts-node scripts/import-timers.ts
   ```

### Étape 4 : Vérifier l'import

1. Allez sur votre admin : `https://votre-app.vercel.app/admin?token=VOTRE_TOKEN`
2. Vérifiez que les timers apparaissent
3. Ou utilisez Prisma Studio :
   ```bash
   npx prisma studio
   ```

---

## 📝 Comment modifier la liste des timers

### Ajouter un nouveau timer

1. Ouvrez `scripts/import-timers.ts`
2. Ajoutez une ligne dans le tableau `timers` :
   ```typescript
   { 
     name: "Nouveau Timer", 
     email: "nouveau@example.com", 
     phone: "33612345678", 
     postcode: "75001", 
     lat: 48.8566, 
     lng: 2.3522, 
     status: "Partner – High Coverage" 
   },
   ```
3. Exécutez à nouveau l'import

### Modifier un timer existant

1. Ouvrez `scripts/import-timers.ts`
2. Modifiez la ligne correspondante
3. Exécutez à nouveau l'import

**Note :** Le script vérifie si l'email existe déjà, donc il ne créera pas de doublon.

### Supprimer un timer

1. Allez sur Prisma Studio :
   ```bash
   npx prisma studio
   ```
2. Cliquez sur **"Timer"**
3. Trouvez le timer à supprimer
4. Cliquez sur la case à cocher à gauche
5. Cliquez sur **"Delete 1 record"**

Ou via l'API admin (à venir).

---

## 🚫 Statuts filtrés (ne seront PAS contactés)

Seuls les timers avec le statut **"No Partner – Refused"** sont ignorés.

Tous les autres seront contactés :
- ✅ `Partner – High Coverage`
- ✅ `Partner – Low Coverage`
- ✅ `Open to Partnership`
- ✅ `No Partner – No News` (vos prospects !)

---

## 📊 Voir tous les timers

Dans l'admin, vous pouvez voir :
- La liste complète des timers
- Leur statut partenaire
- Leur lien de portail

URL : `https://votre-app.vercel.app/admin?token=VOTRE_TOKEN`

---

## ⚠️ Important

- **Ne modifiez pas** le tableau `ACTIVE_STATUSES` dans le script sauf si vous voulez changer les filtres
- Les timers avec `isActive: false` ne seront jamais contactés
- Les timers sans `lat`/`lng` ne seront pas contactés (vérifiez que le géocodage a fonctionné)
