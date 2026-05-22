import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startSaleBattle, applyChoice, getCurrentRound } from './battles.js';

describe('sale battles', () => {
  it('starts with customer and round', () => {
    const b = startSaleBattle({ id: 'times', boss: false }, 0, { id: 'balsam', cost: 18 }, 1);
    assert.equal(b.type, 'sale');
    assert.ok(b.customer);
    assert.equal(b.resistance, b.maxResistance);
    assert.ok(getCurrentRound(b));
  });

  it('can win with strong choices', () => {
    const b = startSaleBattle({ id: 'times', boss: false }, 2, { id: 'fraser', cost: 38 }, 1);
    let safety = 0;
    while (!b.won && !b.lost && safety++ < 24) {
      const round = getCurrentRound(b);
      const best = round.choices.reduce((bi, c, i) => ((c.score || 0) > (round.choices[bi].score || 0) ? i : bi), 0);
      applyChoice(b, best, 2);
    }
    assert.ok(b.won || b.resistance < 30);
  });
});
