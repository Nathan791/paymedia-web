# apps/web_editeur

Nouvelle application éditeur, **indépendante** de `editor-frontend`, `admin-frontend`,
`gateway`, `core`, `content` et `auth-service` — elle ne touche à aucun d'eux et
peut être développée/démontrée sans qu'aucun autre service ne tourne.

## Pourquoi une app à part

Le besoin immédiat était de démontrer un Web Éditeur complet et professionnel
en un temps court, sans dépendre de la stabilité de l'infrastructure backend
réelle (gateway/CORS/ports — voir l'historique des échanges précédents).
Cette app est donc **100% mockée** : aucune requête réseau, tout vit en
mémoire côté navigateur.

## Démarrer

```bash
cd apps/web_editeur
npm install      # ou pnpm install --filter web_editeur depuis la racine
npm run dev      # démarre sur http://localhost:3003
```

Identifiants de démo (aussi pré-remplissables via le bouton sur l'écran de
connexion) :

```
email : ney@paymedia.com
mot de passe : paymedia2026
```

## Architecture (couches, dans l'ordre de dépendance)

```
pages/        ← composants React, ne connaissent QUE les stores
  ↓
stores/       ← état global (Zustand), orchestrent les appels
  ↓
services/     ← règles métier (validations, permissions)
  ↓
repositories/ ← accès aux données ; SEULE couche qui sera remplacée
  ↓
data/mock/    ← données de démonstration structurées
```

**Le jour où on branche la vraie API** : seuls les fichiers dans
`src/repositories/*.ts` changent (ils feront des appels HTTP au lieu de lire
`data/mock/`). Modèles, services, stores et pages ne bougent pas — c'est
précisément la promesse de cette architecture en couches.

## Limites assumées du mode mock

- **Les données ne persistent pas au rechargement complet de la page** —
  tout vit en mémoire JS (`let contentsDb = [...]` dans les repositories).
  Naviguer entre les pages conserve l'état ; un F5 le réinitialise.
- **Les fichiers uploadés** (contenu + couverture) sont convertis en
  `blob:` URLs locales au navigateur via `URL.createObjectURL()` — ils ne
  sont donc jamais réellement "envoyés" nulle part.
- **La modération admin est simulée** depuis le Web Éditeur lui-même (menu
  "Simuler la modération") uniquement pour pouvoir démontrer le cycle de vie
  complet d'un contenu sans dépendre du futur module Admin. Ce sera retiré
  quand l'admin existera réellement.
- La connexion n'accepte qu'un seul compte (`ney@paymedia.com` /
  `paymedia2026`), volontairement — voir `src/data/mock/auth.mock.ts`.

## Modules livrés

- **Authentification** : connexion, session (sessionStorage), déconnexion
- **Tableau de bord** : KPIs, courbe de revenus, contenus les plus
  performants, activité récente
- **Contenus** (module prioritaire) : liste avec filtres/recherche, création
  (glisser-déposer + couverture), détail (avec lecteur epub/pdf/audio/vidéo),
  modification (formulaire pré-rempli avec les valeurs existantes),
  suppression, cycle de vie complet (brouillon → en attente → publié/refusé →
  archivé)
- **Déclencheurs** : QR codes, short-codes, empreintes audio — activation/pause
- **Transactions** : historique des ventes, détection d'anomalies
- **Revenus** : solde, demande de reversement, historique des paiements
- **Analytics** : vue approfondie des tendances et performances par contenu
- **Paramètres** et **Profil** : formulaires simples

## Vérifications effectuées avant livraison

- `npx tsc --noEmit` → 0 erreur
- `npx vite build` → build de production réussi
