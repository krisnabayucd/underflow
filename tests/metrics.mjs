import assert from 'node:assert/strict';
import {candidate} from '../lib/collect.ts';
const p={slug:'test',name:'test',mcap:null,change_7d:0};
assert.equal(candidate(p,null,null).mcap,null);
assert.equal(candidate(p,null,null).fees,null);
assert.equal(candidate(p,{total24h:50,change_7d:999,change_7dover7d:-10},{total24h:10}).feeChange,-10);
assert.equal(candidate(p,{total24h:50,change_7dover7d:-10},{total24h:10}).score,35);
assert.equal(candidate({...p,mcap:1e7,change_7d:1000},{total24h:50,change_7dover7d:1000},{total24h:10}).score,100);
console.log('Metric mapping and missing-data checks passed.');
