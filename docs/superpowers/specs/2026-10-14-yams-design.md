# Yams — Compteur de points : design

Date : 2026-10-14

## Intent & pourquoi

Une application web en **un seul fichier** pour compter les points du jeu de
Yams (variante de Yahtzee) lors de parties réelles entre amis ou en famille.
Les dés sont lancés dans la vraie vie ; l'app sert uniquement à saisir les
résultats et à calculer les points, sans se tromper.

## Buts

- Suivre plusieurs joueurs sur plusieurs manches.
- Calculer automatiquement les points à partir d'une **saisie minimale**
  (on ne ressaisit jamais les 5 dés en entier ; chaque case ne demande que ce
  qu'il faut pour calculer).
- Persister la partie en cours et l'historique des parties passées.

## Non-buts

- Pas de lancer de dés simulé.
- Pas de réseau, de compte, ni de multijoueur en ligne.
- Pas de framework ni de build.

## Anti-buts

- Ne jamais perdre de données (persistance locale + confirmation avant
  suppression).
- Ne pas alourdir la saisie (pas de modale, saisie directe dans la case).

## Contraintes

- Un seul fichier `index.html` (HTML + CSS + JS inline), sans dépendance,
  fonctionnant hors-ligne dans un navigateur.
- Persistance via `localStorage`.
- Interface en français.
- Logique de calcul couverte par des tests Node : `test/scoring.test.js`
  (lancés via `node test/scoring.test.js`).

## Règles de calcul

La valeur **saisie** par le joueur est la valeur « brute » ; l'app calcule les
points. Quatre sections, un TOTAL FINAL par manche.

| Case | Saisie brute | Points calculés |
|------|--------------|-----------------|
| AS | nombre de dés de valeur 1 (0 à 5) | n × 1 |
| DEUX | nombre de dés de valeur 2 | n × 2 |
| TROIS | nombre de dés de valeur 3 | n × 3 |
| QUATRE | nombre de dés de valeur 4 | n × 4 |
| CINQ | nombre de dés de valeur 5 | n × 5 |
| SIX | nombre de dés de valeur 6 | n × 6 |
| **TOTAL** | — | somme AS…SIX (section 1) |
| BRELAN | valeur du brelan (1 à 6) | 3 × valeur |
| FULL | valeur du brelan + valeur de la paire | 3a + 2b |
| CARRÉ | valeur du carré (1 à 6) | 4 × valeur |
| DOUBLE PAIRE | paire 1 + paire 2 | 2a + 2b |
| **TOTAL** | — | somme des 4 cases (section 2) |
| LE PLUS | total des 5 dés | total |
| LE MOINS | total des 5 dés | total |
| **TOTAL** | — | **Le Plus − Le Moins** (section 3) |
| GRANDE SUITE | rien (un clic) | 20 (dés 2-3-4-5-6) |
| PETITE SUITE | rien (un clic) | 15 (dés 1-2-3-4-5) |
| YAM | valeur du yam (1 à 6) | 5 × valeur |
| **TOTAL** | — | somme des 3 cases (section 4) |
| **TOTAL FINAL** | — | section 1 + 2 + 3 + 4 (par manche) |

Points clés :

- Le **TOTAL FINAL** est calculé **par manche** (une valeur par joueur sous
  chaque manche), pas un grand total cumulé.
- Le total de la section **Le Plus / Le Moins** est une **soustraction**
  (`Plus − Moins`), contrairement aux autres sections qui s'additionnent.
- Les suites sont des boutons à cliquer (valeur fixe 20/15) ; re-cliquer vide
  la case.

## Saisie

- Chaque case est un **affichage cliquable** (le score, ou `·` si vide).
- **Clic** → un champ (ou deux champs pour FULL/DOUBLE PAIRE) apparaît,
  pré-rempli avec la valeur brute actuelle.
- **Entrée** ou **clic ailleurs** → la valeur est enregistrée, la case
  ré-affiche le score calculé.
- Les totaux (sections + TOTAL FINAL) se mettent à jour immédiatement, sans
  recharger la page.

## Disposition

- **Par manche** : en-tête `Manche 1`, `Manche 2`, … chaque manche regroupant
  ses colonnes de joueurs.
- **Sous chaque manche** : le champ prénom de chaque joueur (le même prénom
  est synchronisé sur toutes les manches ; le bouton de suppression `×`
  n'apparaît que dans la première manche).
- Les combinaisons sont des **lignes** (première colonne fixe) ; les joueurs
  des colonnes.
- Colonnes de même largeur (`table-layout: fixed`).

## Manches

- Nombre de manches : **2 à 10**, défaut **3**.
- Modifiable en début **et en milieu de partie** ; réduire les manches
  supprime les scores des manches retirées (avec confirmation).

## Joueurs

- Un joueur par défaut ; bouton `+ Ajouter un joueur`.
- Prénom modifiable, suppression via `×` (avec confirmation).

## Historique

- Bouton `Sauvegarder la partie` → ajoute un instantané daté.
- Page `Parties sauvegardées` : liste **triée par date décroissante** ; la date
  est un lien ouvrant le **détail en lecture seule** (même tableau, sans
  saisie).
- Suppression d'une entrée possible (`×`, avec confirmation).

## Persistance

- `localStorage` :
  - `yams.current` : état de la partie en cours (survit au rechargement).
  - `yams.history` : tableau des parties sauvegardées.

## Ce qui reste au builder (décisions restantes)

- **Validation des saisies** : borner les valeurs aux plages de la spec
  (nb de dés 0–5, valeur 1–6, total ≥ 0, arrondi des décimales) — *planifié
  dans `docs/superpowers/plans/2026-10-14-yams-validation.md`*.
- Mise en évidence d'un **gagnant global** (total cumulé sur toutes les
  manches) — non implémenté (le TOTAL FINAL est par manche).
- Finitions visuelles éventuelles.
