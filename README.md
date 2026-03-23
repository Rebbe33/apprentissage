# SkillForge 🔧

Application d'apprentissage par compétences avec arborescence libre, séances d'entraînement et progression en checklist.

## Stack

- **Vite + React + TypeScript**
- **Zustand** — gestion d'état
- **Supabase** — base de données (PostgreSQL + Auth)
- **Tailwind CSS v3**
- **Vercel** — déploiement

---

## 1. Installation locale

```bash
git clone https://github.com/TON_USER/skillforge.git
cd skillforge
npm install
cp .env.example .env
# → Remplis les variables dans .env
npm run dev
```

> Sans Supabase configuré, l'app fonctionne en mode localStorage automatiquement.

---

## 2. Configuration Supabase

### Créer le projet
1. Va sur [supabase.com](https://supabase.com) → New project
2. Note l'**URL** et la clé **anon public**

### Créer la table
Dans ton dashboard Supabase → **SQL Editor**, colle et exécute le contenu de `supabase_schema.sql`.

### Variables d'environnement
Dans `.env` :
```
VITE_SUPABASE_URL=https://XXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

> Pour la prod sur Vercel, ajoute ces mêmes variables dans **Settings → Environment Variables**.

---

## 3. Brancher le store sur Supabase

Le fichier `src/store/index.ts` contient actuellement un mode localStorage.
Pour activer Supabase, remplace la fonction `syncToSupabase` par les appels de `src/lib/supabase.ts` :

```ts
// Dans src/store/index.ts, remplace syncToSupabase par :
import { updateDomain, createDomain, deleteDomain } from '../lib/supabase'
```

Les fonctions CRUD sont déjà prêtes dans `src/lib/supabase.ts`.

---

## 4. Déploiement Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Ou connecte le repo GitHub à [vercel.com](https://vercel.com) (auto-deploy à chaque push).

---

## Structure du projet

```
src/
├── types/          # TypeScript — Domain, TreeNode, StepNode, GroupNode
├── lib/
│   ├── tree.ts     # Utilitaires arbre (find, update, delete, add, countDone...)
│   └── supabase.ts # CRUD Supabase prêt à l'emploi
├── store/
│   └── index.ts    # Zustand store (localStorage + Supabase sync)
├── components/
│   ├── ui/         # Boutons, modals, badges, progress bar, pickers
│   ├── domain/     # Modals ajout/suppression de domaine
│   ├── tree/       # Sidebar arborescence + NodeDetail + AddNodeModal
│   └── session/    # Vue séance d'entraînement
└── App.tsx         # Layout principal, routing entre vues
```

---

## Fonctionnalités

| Feature | Status |
|---|---|
| Arborescence illimitée (groupes + étapes) | ✅ |
| Mode Séquentiel (verrouillage progressif) | ✅ |
| Mode Aléatoire | ✅ |
| Séance d'entraînement avec cochage | ✅ |
| Notes par étape | ✅ |
| Multi-domaines avec onglets colorés | ✅ |
| Ajout/suppression de nœuds à la volée | ✅ |
| Bascule de mode séquentiel↔aléatoire | ✅ |
| Export JSON | ✅ |
| Persistance localStorage | ✅ |
| Sync Supabase | 🔧 Prête (activer dans store) |
| Auth utilisateur | 🔧 Prête (Supabase Auth) |
