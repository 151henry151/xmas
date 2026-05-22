import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { restock, buyUpgrade, totalStock } from './economy.js';
import { defaultProfile as dp } from './store.js';

describe('economy', () => {
  it('restocks when player has cash', () => {
    const u = dp('eco1', 'rookie');
    u.cash = 200;
    const before = totalStock(u.stock);
    const out = restock(u);
    assert.ok(out.ok);
    assert.ok(totalStock(u.stock) > before);
  });

  it('rejects upgrade without cash', () => {
    const u = dp('eco2', 'rookie');
    u.cash = 0;
    const out = buyUpgrade(u, 'heater');
    assert.ok(out.error);
  });
});
