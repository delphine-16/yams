'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('Balise <script> introuvable dans index.html');
const script = match[1];

function loadSandbox() {
  const sandbox = {
    document: {
      getElementById: () => ({ innerHTML: '' }),
      addEventListener: () => {},
      createElement: () => ({
        innerHTML: '', className: '', textContent: '', style: {},
        classList: { add() {}, remove() {}, toggle() {} },
        querySelector: () => null, querySelectorAll: () => [], remove() {}, addEventListener() {},
      }),
      body: { appendChild: () => {} },
      querySelectorAll: () => [],
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    requestAnimationFrame: () => {},
    confirm: () => false,
  };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { filename: 'index.html' });
  return sandbox;
}

const sandbox = loadSandbox();
const computeScore = sandbox.computeScore;
const sectionTotal = sandbox.sectionTotal;
const playerGrandTotal = sandbox.playerGrandTotal;
const mancheTotal = sandbox.mancheTotal;
const sanitizeRaw = sandbox.sanitizeRaw;

assert.strictEqual(typeof computeScore, 'function', 'computeScore doit exister');

// AS -> SIX : n = nombre de dés, points = n * valeur
assert.strictEqual(computeScore('as', 3), 3, 'as: 3 dés de 1 = 3');
assert.strictEqual(computeScore('deux', 3), 6, 'deux: 3 dés de 2 = 6');
assert.strictEqual(computeScore('trois', 0), 0, 'trois: 0 dé = 0');
assert.strictEqual(computeScore('quatre', 3), 12, 'quatre: 3 dés de 4 = 12');
assert.strictEqual(computeScore('cinq', 5), 25, 'cinq: 5 dés de 5 = 25');
assert.strictEqual(computeScore('six', 4), 24, 'six: 4 dés de 6 = 24');

// Combinaisons à une valeur
assert.strictEqual(computeScore('brelan', 5), 15, 'brelan: valeur 5 = 15');
assert.strictEqual(computeScore('carre', 3), 12, 'carre: valeur 3 = 12');
assert.strictEqual(computeScore('yam', 6), 30, 'yam: valeur 6 = 30');

// Combinaisons à deux valeurs
assert.strictEqual(computeScore('full', [4, 2]), 16, 'full: brelan 4 + paire 2 = 3*4+2*2 = 16');
assert.strictEqual(computeScore('doublePaire', [3, 5]), 16, 'double paire: 3+3 et 5+5 = 2*3+2*5 = 16');

// Totaux directs
assert.strictEqual(computeScore('plus', 22), 22, 'le plus: total direct 22');
assert.strictEqual(computeScore('moins', 7), 7, 'le moins: total direct 7');

// Suites (fixes)
assert.strictEqual(computeScore('grandeSuite', 20), 20, 'grande suite = 20');
assert.strictEqual(computeScore('petiteSuite', 15), 15, 'petite suite = 15');

// Case vide
assert.strictEqual(computeScore('as', null), null, 'case vide -> null');
assert.strictEqual(computeScore('brelan', null), null, 'brelan vide -> null');
assert.strictEqual(computeScore('full', null), null, 'full vide -> null');

// Totaux de section et total final sur un état d'exemple
const st = {
  manches: 1,
  players: [{ id: 1, name: 'Alice' }],
  scores: {
    1: {
      0: {
        as: 3, deux: 0, trois: 1, quatre: 0, cinq: 2, six: 1,   // 3 + 0 + 3 + 0 + 10 + 6 = 22
        brelan: 5, full: [4, 2], carre: 3, doublePaire: [3, 5],  // 15 + 16 + 12 + 16 = 59
        plus: 22, moins: 7,                                       // plus - moins = 15
        grandeSuite: 20, petiteSuite: 15, yam: 6,                // 20 + 15 + 30 = 65
      },
    },
  },
};

assert.strictEqual(sectionTotal(st, 1, 0, 1), 22, 'section 1 = 22');
assert.strictEqual(sectionTotal(st, 1, 0, 2), 59, 'section 2 = 59');
assert.strictEqual(sectionTotal(st, 1, 0, 3), 15, 'section 3 = plus - moins = 15');
assert.strictEqual(sectionTotal(st, 1, 0, 4), 65, 'section 4 = 65');
assert.strictEqual(mancheTotal(st, 1, 0), 22 + 59 + 15 + 65, 'total manche');
assert.strictEqual(playerGrandTotal(st, 1), 22 + 59 + 15 + 65, 'total final');

// Validation des saisies (sanitizeRaw)
assert.strictEqual(sanitizeRaw({ kind: 'count' }, 9), 5, 'nb de dés > 5 borné à 5');
assert.strictEqual(sanitizeRaw({ kind: 'count' }, -2), 0, 'nb de dés négatif borné à 0');
assert.strictEqual(sanitizeRaw({ kind: 'value' }, 0), 1, 'valeur < 1 bornée à 1');
assert.strictEqual(sanitizeRaw({ kind: 'value' }, 9), 6, 'valeur > 6 bornée à 6');
assert.deepStrictEqual(Array.from(sanitizeRaw({ kind: 'pair' }, [9, 0])), [6, 1], 'paire bornée [1..6]');
assert.strictEqual(sanitizeRaw({ kind: 'total' }, -5), 0, 'total négatif borné à 0');
assert.strictEqual(sanitizeRaw({ kind: 'count' }, 3.6), 4, 'décimale arrondie');
assert.strictEqual(sanitizeRaw({ kind: 'count' }, null), null, 'null reste null');

console.log('Tous les tests passent ✓');
