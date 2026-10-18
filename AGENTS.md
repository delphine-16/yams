# AGENTS.md — Projet Yams

Instructions pour les agents qui travaillent sur ce projet.

## C'est quoi

Application web **PWA** de comptage des points pour le jeu de Yams (Yahtzee).
Un seul fichier principal : `index.html` (HTML + CSS + JS inline).
Utilisable sur PC (navigateur) et Android (installable, hors-ligne).
Hébergée sur GitHub Pages : https://delphine-16.github.io/yams/

## À lire pour comprendre

- `README.md` — présentation, règles, déploiement, procédure de mise à jour.
- `CHANGELOG.md` — historique des évolutions.
- `docs/superpowers/specs/` et `docs/superpowers/plans/` — spec et plan initiaux.

## Structure clé

- `index.html` — l'app (logique de calcul + rendu + PWA).
- `service-worker.js` — cache PWA (page en « réseau d'abord », cache hors-ligne).
- `manifest.json` — métadonnées PWA.
- `favicon*.png` — icônes.
- `test/scoring.test.js` — tests Node de la logique de calcul (`node test/scoring.test.js`).

## Règles importantes (logique de calcul)

- Saisie directe du **total** par case (pas de saisie des dés).
- Bonus automatiques : Brelan +10, Full +20, Carré +30, Grande Suite +40,
  Petite Suite +40, Yam +50 ; +10 si total AS→SIX ≥ 40.
- TOTAL 3 = Le Plus − Le Moins ; **0 si l'une des deux cases est vide ou rayée**.
- Une case peut être **rayée** (valeur `'raye'`, compte 0).
- Gagnant de chaque manche surligné (TOTAL FINAL).

## Workflow git (obligatoire)

1. Modifier les fichiers.
2. **Mettre à jour `CHANGELOG.md`** (et `README.md` si besoin).
3. **Committer ET pousser avant de fermer le terminal** :
   ```bash
   git add .
   git commit -m "description"
   git push
   ```
4. La page se met à jour automatiquement sur la PWA (réseau d'abord).
   Si nécessaire, incrémenter `CACHE` dans `service-worker.js`.

## Prochaine étape prévue

- **Synchronisation des parties entre appareils** : ajouter une **base de données
  (Supabase)** + une **authentification** (email / mot de passe), en complément du
  `localStorage` actuel (qui reste le mode hors-ligne).
- **État actuel** : compte Supabase + projet **créés**. Identifiants à récupérer
  (Project URL + clé `anon`) avant d'implémenter.
- **Reste à faire** :
  1. Créer la table `parties` + règles RLS + activer l'auth email/mot de passe.
  2. Écran de connexion/inscription + gestion de session dans l'app.
  3. Sauvegarde/chargement des parties via Supabase (intégré à l'historique).
  4. Tests (sync PC ↔ téléphone) + déploiement.
