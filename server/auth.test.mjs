import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { register, login, verifyToken } from './auth.js';

const usersFile = join(dirname(fileURLToPath(import.meta.url)), '../data/users.json');

describe('auth', () => {
  before(() => {
    if (existsSync(usersFile)) unlinkSync(usersFile);
  });
  after(() => {
    if (existsSync(usersFile)) unlinkSync(usersFile);
  });

  it('registers and logs in', () => {
    const reg = register('testvendor', 'secret123', 'hustler');
    assert.ok(reg.token);
    assert.equal(reg.profile.sellerId, 'hustler');
    const bad = login('testvendor', 'wrong');
    assert.ok(bad.error);
    const ok = login('testvendor', 'secret123');
    assert.ok(ok.token);
    const user = verifyToken(ok.token);
    assert.equal(user.username, 'testvendor');
  });
});
