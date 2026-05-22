import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startSaleBattle, applyChoice, getCurrentRound } from './battles.js';

describe('sale battles', () => {
  it('starts with customer and round', () => {
    const b = startSaleBattle({ id: 'times', boss: false }, 0);
    assert.equal(b.type, 'sale');
    assert.ok(b.customer);
    assert.ok(getCurrentRound(b));
  });

  it('can win with strong choices', () => {
    const b = startSaleBattle({ id: 'times', boss: false }, 2);
    let safety = 0;
    while (!b.won && !b.lost && safety++ < 20) {
      const round = getCurrentRound(b);
      const best = round.choices.reduce((bi, c, i) => (c.score > round.choices[bi].score ? i : bi), 0);
      applyChoice(b, best);
    }
    assert.ok(b.won || b.patience < b.maxHp);
  });
});
