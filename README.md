# Yams — Compteur de points

Application web (**PWA**) pour compter les points du jeu de Yams (Yahtzee).
Utilisable sur **PC** (navigateur) et sur **mobile Android** (installable, hors-ligne).

En ligne : <https://delphine-16.github.io/yams/>

## Fonctionnalités

- Suivi de plusieurs joueurs sur plusieurs manches (2 à 10).
- Saisie directe du **total de points** par case, calcul automatique des totaux.
- **Bonus** automatiques (voir règles ci-dessous).
- **« Rayer » une case** : éliminer une combinaison sur un tour (la case compte 0).
- **Gagnant de chaque manche** surligné en doré.
- **Historique** des parties sauvegardées (dans `localStorage`).
- **PWA** : installable sur l'écran d'accueil, fonctionne hors-ligne.

## Règles de calcul

| Case | Saisie | Bonus |
|------|--------|-------|
| AS → SIX | total des dés de cette valeur | +10 sur la section si le total atteint 40 |
| BRELAN | total | +10 |
| FULL | total | +20 |
| CARRÉ | total | +30 |
| DOUBLE PAIRE | total | — |
| LE PLUS / LE MOINS | total | — (TOTAL 3 = Plus − Moins, 0 si une case est vide ou rayée) |
| GRANDE SUITE | clic | +40 |
| PETITE SUITE | clic | +40 |
| YAM | total | +50 |

Les bonus sont affichés dans les libellés et ajoutés automatiquement aux totaux.

## Structure du projet

- `index.html` — l'application (HTML + CSS + JS).
- `manifest.json` — métadonnées PWA.
- `service-worker.js` — cache hors-ligne.
- `favicon.png`, `favicon-192.png`, `favicon-512.png` — icônes.
- `test/scoring.test.js` — tests de la logique de calcul (Node.js).
- `docs/` — spec et plans (Superpowers).

## Utilisation en local

Ouvrir `index.html` directement dans un navigateur, ou servir pour tester la PWA :

```bash
cd /home/delphine/projets/yams
python3 -m http.server 8001
# puis ouvrir http://localhost:8001
```

## Déploiement (GitHub Pages)

Le projet est hébergé sur GitHub Pages :
<https://github.com/delphine-16/yams>

Pour publier une mise à jour, voir la section suivante.

## Mettre à jour le projet

1. Modifier les fichiers.
2. **Mettre à jour `CHANGELOG.md`** (et `README.md` si nécessaire) pour noter ce qui a changé — ainsi on sait toujours où on en est.
3. **⚠️ Avant de fermer le terminal : committer ET pousser**, sinon les changements ne seront ni enregistrés localement, ni publiés sur le téléphone.

```bash
cd /home/delphine/projets/yams
git add .
git commit -m "description du changement"
git push
```

4. Si la PWA ne se met pas à jour sur le téléphone, **incrémenter la version du cache** dans `service-worker.js` (`yams-v2` → `yams-v3`) pour forcer la récupération de la nouvelle version.

## À venir (prévision)

- **Synchronisation des parties entre appareils** via une **base de données** (Supabase) et une **authentification** (email / mot de passe), en complément du `localStorage` actuel (qui restera le mode hors-ligne).
