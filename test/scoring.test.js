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
const bonusFor = sandbox.bonusFor;

function loadCapturingSandbox() {
  const saved = { value: null };
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
    localStorage: { getItem: () => null, setItem: (k, v) => { saved.value = JSON.parse(v); }, removeItem: () => {} },
    requestAnimationFrame: () => {},
    confirm: () => false,
  };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox, { filename: 'index.html' });
  return { sandbox, saved };
}

assert.strictEqual(typeof computeScore, 'function', 'computeScore doit exister');

// Toutes les cases numériques : le total saisi est retourné tel quel
assert.strictEqual(computeScore('as', 3), 3, 'as: total 3');
assert.strictEqual(computeScore('deux', 6), 6, 'deux: total 6');
assert.strictEqual(computeScore('trois', 0), 0, 'trois: total 0');
assert.strictEqual(computeScore('quatre', 12), 12, 'quatre: total 12');
assert.strictEqual(computeScore('cinq', 25), 25, 'cinq: total 25');
assert.strictEqual(computeScore('six', 24), 24, 'six: total 24');
assert.strictEqual(computeScore('brelan', 15), 15, 'brelan: total 15');
assert.strictEqual(computeScore('carre', 12), 12, 'carre: total 12');
assert.strictEqual(computeScore('yam', 30), 30, 'yam: total 30');
assert.strictEqual(computeScore('full', 16), 16, 'full: total 16');
assert.strictEqual(computeScore('doublePaire', 16), 16, 'double paire: total 16');
assert.strictEqual(computeScore('plus', 22), 22, 'le plus: total 22');
assert.strictEqual(computeScore('moins', 7), 7, 'le moins: total 7');

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
        as: 3, deux: 6, trois: 3, quatre: 12, cinq: 10, six: 6,  // 3+6+3+12+10+6 = 40
        brelan: 15, full: 16, carre: 12, doublePaire: 16,         // 15+16+12+16 = 59
        plus: 22, moins: 7,                                        // plus - moins = 15
        grandeSuite: 20, petiteSuite: 15, yam: 30,                 // 20+15+30 = 65
      },
    },
  },
};

assert.strictEqual(sectionTotal(st, 1, 0, 1), 50, 'section 1 = 40 + 10 (bonus ≥ 40)');
assert.strictEqual(sectionTotal(st, 1, 0, 2), 119, 'section 2 = 59 + 60 (bonus)');
assert.strictEqual(sectionTotal(st, 1, 0, 3), 15, 'section 3 = plus - moins = 15');
assert.strictEqual(sectionTotal(st, 1, 0, 4), 195, 'section 4 = 65 + 130 (bonus)');
assert.strictEqual(mancheTotal(st, 1, 0), 50 + 119 + 15 + 195, 'total manche');
assert.strictEqual(playerGrandTotal(st, 1), 50 + 119 + 15 + 195, 'total final');

// TOTAL 3 : 0 si une des deux cases (plus/moins) n'est pas remplie
const stPlusOnly = { manches: 1, players: [{ id: 1, name: 'Alice' }], scores: { 1: { 0: { plus: 22 } } } };
const stMoinsOnly = { manches: 1, players: [{ id: 1, name: 'Alice' }], scores: { 1: { 0: { moins: 7 } } } };
assert.strictEqual(sectionTotal(stPlusOnly, 1, 0, 3), 0, 'total 3 = 0 si moins manquant');
assert.strictEqual(sectionTotal(stMoinsOnly, 1, 0, 3), 0, 'total 3 = 0 si plus manquant');

// TOTAL 3 : 0 si une des deux cases est rayée
const stPlusRaye = { manches: 1, players: [{ id: 1, name: 'Alice' }], scores: { 1: { 0: { plus: 'raye', moins: 7 } } } };
const stMoinsRaye = { manches: 1, players: [{ id: 1, name: 'Alice' }], scores: { 1: { 0: { plus: 22, moins: 'raye' } } } };
assert.strictEqual(sectionTotal(stPlusRaye, 1, 0, 3), 0, 'total 3 = 0 si plus rayé');
assert.strictEqual(sectionTotal(stMoinsRaye, 1, 0, 3), 0, 'total 3 = 0 si moins rayé');

// Validation des saisies (sanitizeRaw) : total ≥ 0, arrondi
assert.strictEqual(sanitizeRaw(9), 9, 'total 9 conservé');
assert.strictEqual(sanitizeRaw(-5), 0, 'négatif borné à 0');
assert.strictEqual(sanitizeRaw(3.6), 4, 'décimale arrondie');
assert.strictEqual(sanitizeRaw(null), null, 'null reste null');

// Bonus
assert.strictEqual(bonusFor('brelan', 15), 10, 'brelan: bonus +10');
assert.strictEqual(bonusFor('full', 16), 20, 'full: bonus +20');
assert.strictEqual(bonusFor('carre', 12), 30, 'carre: bonus +30');
assert.strictEqual(bonusFor('grandeSuite', 20), 40, 'grande suite: bonus +40');
assert.strictEqual(bonusFor('petiteSuite', 15), 40, 'petite suite: bonus +40');
assert.strictEqual(bonusFor('yam', 30), 50, 'yam: bonus +50');
assert.strictEqual(bonusFor('brelan', null), 0, 'brelan vide: pas de bonus');
assert.strictEqual(bonusFor('brelan', 'raye'), 0, 'brelan rayé: pas de bonus');
assert.strictEqual(bonusFor('doublePaire', 16), 0, 'double paire: pas de bonus');

// Case rayée = 0 point
assert.strictEqual(computeScore('brelan', 'raye'), 0, 'case rayée (brelan) = 0');
assert.strictEqual(computeScore('yam', 'raye'), 0, 'case rayée (yam) = 0');

// Ajout de joueur : ids uniques (régression)
const capture = loadCapturingSandbox();
capture.sandbox.addPlayer();
assert.strictEqual(capture.saved.value.players.length, 2, '2 joueurs après ajout');
assert.notStrictEqual(capture.saved.value.players[0].id, capture.saved.value.players[1].id, 'ids uniques après ajout');

console.log('Tous les tests passent ✓');
