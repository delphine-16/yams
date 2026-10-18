# Changelog

> **À maintenir à chaque session de travail** : ajouter un bloc daté listant les changements, avant de committer/pousser. Ainsi on sait toujours où on en est.

Historique des évolutions du projet Yams.

## 2026-10-18
- Alignement de la couleur du point (`·`) des cases Grande/Petite Suite sur celle des autres cases.

## 2026-10-17
- Ajout de la **PWA** : `manifest.json`, `service-worker.js`, icônes (`favicon.png`, `favicon-192.png`, `favicon-512.png`).
- Déploiement sur **GitHub Pages**.
- Remplacement des icônes générées par le favicon personnalisé.

## 2026-10-16
- Hauteur des cases numériques et des suites portée à **42px** (uniforme).
- Bonus **Petite Suite** passé de +30 à **+40**.
- **TOTAL 3** (Le Plus / Le Moins) = 0 si l'une des deux cases est vide **ou rayée**.
- Padding des éditeurs (champ « pts » / bouton « Rayer ») aligné sur les suites.

## 2026-10-15
- **Bonus automatiques** : Brelan +10, Full +20, Carré +30, Grande Suite +40, Petite Suite +30, Yam +50, et +10 si le total AS→SIX atteint 40 — affichés dans les libellés.
- **« Rayer » une case** (éliminer une combinaison sur un tour).
- **Gagnant de chaque manche** surligné.
- **Couleur différente par manche** (sans rouge ni bleu).
- Bouton « Nouvelle partie » en violet.
- Corrections de bugs : ids de joueurs dupliqués, rayer plusieurs cases, cases vides affichées à 80px (classe `.empty`).

## 2026-10-14
- **Version initiale** : calcul des points, saisie inline (clic pour éditer), historique des parties, tests Node (`test/scoring.test.js`).

## À venir (prévision)

- **Synchronisation des parties entre appareils** via une **base de données** (Supabase) et une **authentification** (email / mot de passe), pour retrouver les mêmes parties sur PC et mobile.
