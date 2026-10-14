# Validation des saisies — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Borner les valeurs saisies dans chaque case aux plages valides définies dans la spec (nb de dés 0–5, valeur 1–6, total ≥ 0, décimale arrondie).

**Architecture:** Ajouter une fonction pure `sanitizeRaw(spec, raw)` dans `index.html` qui arrondit puis borne la valeur brute selon le type de case, et l'appeler dans `commitCell` avant d'enregistrer.

**Tech Stack:** HTML/CSS/JS vanilla (un fichier `index.html`), tests Node (`node:assert` + `node:vm` dans `test/scoring.test.js`).

**Spec:** `docs/superpowers/specs/2026-10-14-yams-design.md`

## Global Constraints

- Un seul fichier `index.html` (pas de dépendance, pas de build).
- Tests lancés via `node test/scoring.test.js`.
- Pas de dépôt git : les étapes « commit » sont ignorées.

## Review Focus

- Nombre de dés > 5 (ex. 9) → borné à 5.
- Valeur < 1 (ex. 0 ou −3) pour brelan/carré/yam → bornée à 1.
- Valeur > 6 (ex. 9) → bornée à 6.
- Total négatif pour Le Plus / Le Moins → borné à 0.
- Valeur décimale (ex. 3.6) → arrondie à l'entier.
- Case vide → reste `null` (pas de valeur).

---

### Task 1: Bornage des saisies

**Files:**
- Modify: `index.html` (ajout de `sanitizeRaw` + appel dans `commitCell`)
- Test: `test/scoring.test.js`

**Interfaces:**
- Produces: `sanitizeRaw(spec, raw) -> number | [number, number] | null`
  - `spec` est un élément de `INPUT_SPEC` (champ `kind` : `count`, `value`, `pair`, `total`).
  - `raw` est la valeur brute (nombre, tableau `[a, b]`, ou `null`).
  - Retourne la valeur arrondie et bornée, ou `null` si `raw` est `null`.

- [ ] **Step 1: Écrire les tests qui échouent**

Dans `test/scoring.test.js`, ajouter la référence `sanitizeRaw` au sandbox puis :

```js
const sanitizeRaw = sandbox.sanitizeRaw;

assert.strictEqual(sanitizeRaw({ kind: 'count' }, 9), 5, 'nb de dés > 5 borné à 5');
assert.strictEqual(sanitizeRaw({ kind: 'count' }, -2), 0, 'nb de dés négatif borné à 0');
assert.strictEqual(sanitizeRaw({ kind: 'value' }, 0), 1, 'valeur < 1 bornée à 1');
assert.strictEqual(sanitizeRaw({ kind: 'value' }, 9), 6, 'valeur > 6 bornée à 6');
assert.deepStrictEqual(sanitizeRaw({ kind: 'pair' }, [9, 0]), [6, 1], 'paire bornée [1..6]');
assert.strictEqual(sanitizeRaw({ kind: 'total' }, -5), 0, 'total négatif borné à 0');
assert.strictEqual(sanitizeRaw({ kind: 'count' }, 3.6), 4, 'décimale arrondie');
assert.strictEqual(sanitizeRaw({ kind: 'count' }, null), null, 'null reste null');
```

- [ ] **Step 2: Lancer les tests pour vérifier l'échec**

Run: `node test/scoring.test.js`
Expected: FAIL — `sandbox.sanitizeRaw` est `undefined`.

- [ ] **Step 3: Implémenter `sanitizeRaw` dans `index.html`**

Ajouter, à côté de `computeScore`, une fonction pure :

```js
function sanitizeRaw(spec, raw) {
  if (raw == null) return null;
  const int = v => Math.round(v);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  if (spec.kind === 'pair') return [clamp(int(raw[0]), 1, 6), clamp(int(raw[1]), 1, 6)];
  const v = int(raw);
  if (spec.kind === 'count') return clamp(v, 0, 5);
  if (spec.kind === 'value') return clamp(v, 1, 6);
  return clamp(v, 0, Infinity);
}
```

Puis, dans `commitCell`, remplacer la valeur `raw` calculée par
`sanitizeRaw(spec, raw)` juste avant `setScore(...)`.

- [ ] **Step 4: Lancer les tests pour vérifier le succès**

Run: `node test/scoring.test.js`
Expected: PASS — tous les tests (existants + nouveaux) passent.

---

## Self-review

- **Couverture spec** : la spec liste les plages (0–5, 1–6, ≥ 0) et l'arrondi ;
  chaque plage est couverte par un test de la Task 1.
- **Cohérence des types** : `sanitizeRaw` est référencée telle quelle dans
  `commitCell` ; aucune autre fonction ne l'utilise.
- **Review Focus** : les 6 cas listés correspondent aux 8 assertions de la
  Task 1.
- **Proportion** : une tâche unique, plan court.
