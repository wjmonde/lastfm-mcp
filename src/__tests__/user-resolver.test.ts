import assert from 'node:assert/strict';
import { DefaultUserResolver } from '../user-resolver.js';

const personal = new DefaultUserResolver('WJMonde');
assert.equal(personal.resolve().username, 'WJMonde');
assert.equal(personal.resolve('OtherListener').username, 'OtherListener');

const publicResolver = new DefaultUserResolver();
assert.equal(publicResolver.resolve('AnotherUser').username, 'AnotherUser');
assert.throws(() => publicResolver.resolve(), /Last\.fm username is required/);

console.error('user resolver test passed');
