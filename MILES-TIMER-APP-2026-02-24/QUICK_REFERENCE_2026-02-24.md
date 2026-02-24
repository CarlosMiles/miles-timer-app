# Référence Rapide - Miles Timer App

**Date : 24 février 2026**

---

## 📁 Structure des fichiers

```
MILES-TIMER-APP-2026-02-24/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhooks/tally/route.ts      # Réception Tally
│   │   │   ├── leads/route.ts               # Liste des leads
│   │   │   ├── leads/[id]/research/route.ts # Lancer recherche
│   │   │   ├── timers/route.ts              # Gestion des timers
│   │   │   └── chrono/[token]/              # API portail chrono
│   │   ├── admin/page.tsx                   # Dashboard admin
│   │   ├── chrono/[token]/page.tsx          # Portail chrono
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── db.ts                            # Base de données
│       ├── geo.ts                           # Géocodage + distance
│       └── email.ts                         # Emails Resend
├── prisma/
│   └── schema.prisma                        # Modèle de données
├── .env.example                             # Variables d'environnement
├── DEPLOYMENT_GUIDE_2026-02-24.md           # Guide complet
├── QUICK_REFERENCE_2026-02-24.md            # Ce fichier
├── next.config.js
├── vercel.json
├── package.json
└── tsconfig.json
```

---

## 🔄 Flux de travail

```
TALLY FORM
    ↓
/api/webhooks/tally
    ↓
PostgreSQL (Lead créé)
    ↓
Admin Dashboard (vous voyez le lead)
    ↓
Vous cliquez "Lancer recherche"
    ↓
/api/leads/[id]/research
    ↓
Trouve timers dans 300km
    ↓
Envoie emails via Resend
    ↓
Timer clique lien dans email
    ↓
/chrono/[token]
    ↓
Timer change statut
    ↓
Si premier "EN_ATTENTE" → email organisateur
```

---

## 📊 Modèle de données

### Lead
- `id`, `createdAt`, `updatedAt`
- `eventName`, `eventDate`, `city`, `postcode`, `lat`, `lng`
- `participants`, `discipline`, `notes`
- `organizerName`, `organizerEmail`, `organizerPhone`
- `status` : NOUVEAU, TIMERS_CONTACTES, EN_ATTENTE, DEVIS_ENVOYE, GAGNE, PERDU, PAS_DISPONIBLE

### Timer
- `id`, `createdAt`
- `name`, `companyName`, `email`, `phone`
- `postcode`, `lat`, `lng`
- `accessToken` (lien unique)
- `isActive`

### Assignment (lien Lead-Timers)
- `id`, `createdAt`
- `leadId`, `timerId`
- `status` : A_CONTACTER, EN_ATTENTE, DEVIS_ENVOYE, GAGNE, PERDU, PAS_DISPONIBLE
- `distanceKm`, `emailSentAt`, `respondedAt`

---

## 🔌 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/webhooks/tally` | POST | Reçoit les soumissions Tally |
| `/api/leads` | GET | Liste tous les leads (admin) |
| `/api/leads/[id]/research` | POST | Lance la recherche de timers |
| `/api/timers` | GET | Liste tous les timers (admin) |
| `/api/timers` | POST | Crée un nouveau timer (admin) |
| `/api/chrono/[token]/leads` | GET | Liste les leads d'un timer |
| `/api/chrono/[token]/lead/[id]` | POST | Met à jour le statut |

---

## 🎨 Statuts

### Statuts Lead
| Statut | Description |
|--------|-------------|
| NOUVEAU | Lead vient d'arriver |
| TIMERS_CONTACTES | Emails envoyés aux timers |
| EN_ATTENTE | Un timer a répondu dispo |
| DEVIS_ENVOYE | Le timer a envoyé son devis |
| GAGNE | Le timer a eu le contrat |
| PERDU | Le timer n'a pas eu le contrat |
| PAS_DISPONIBLE | Aucun timer dispo |

### Statuts Timer (Assignment)
| Statut | Description |
|--------|-------------|
| A_CONTACTER | Le timer doit contacter l'organisateur |
| EN_ATTENTE | Mis en relation par Miles Republic |
| DEVIS_ENVOYE | Devis envoyé |
| GAGNE | Contrat gagné |
| PERDU | Contrat perdu |
| PAS_DISPONIBLE | Timer indisponible |

---

## 💰 Coût

| Service | Coût |
|---------|------|
| Railway (PostgreSQL) | 0€ (500 Mo) |
| Resend (Emails) | 0€ (3 000/jour) |
| Vercel (Hébergement) | 0€ |
| GitHub (Code) | 0€ |
| **Total** | **0€** |

---

## 🔧 Commandes utiles

```bash
# Installer les dépendances
npm install

# Lancer en local
npm run dev

# Créer les tables
npx prisma migrate deploy

# Voir la base de données
npx prisma studio

# Générer le client Prisma
npx prisma generate
```

---

## 📧 Email envoyé au timer

```
Objet : Nouveau devis - [Nom événement] ([Ville])

Bonjour [Nom timer],

Nouvelle demande de devis chronométrage :

📍 Événement : [Nom]
📅 Date : [Date]
📮 Lieu : [Ville] ([CP])
👥 Participants : [Nombre]

Pour voir les détails et répondre :
👉 https://votre-app.vercel.app/chrono/[token]/lead/[id]

---
Miles Republic
```

---

## 📧 Email envoyé à l'organisateur (si premier timer)

```
Objet : Chronométreur disponible - [Nom événement]

Bonjour [Nom organisateur],

Bonne nouvelle ! Un chronométreur est disponible :

📍 [Nom événement]
📅 [Date]
📮 [Ville]

Contact :
• [Nom timer]
• Email : [email]
• Téléphone : [téléphone]

---
Miles Republic
```
