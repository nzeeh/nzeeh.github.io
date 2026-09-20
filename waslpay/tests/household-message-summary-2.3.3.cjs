'use strict';
const assert=require('node:assert/strict');
const H=require('../household-message-summary-2.3.3.js');
let count=0;function test(name,fn){fn();console.log('PASS '+name);count++;}
const household={kind:'householdPay',receipt:{householdLeft:2250,householdLimit:3000}};
const exhausted={kind:'householdPay',receipt:{householdLeft:0,householdLimit:3000}};
test('release is 2.3.3',()=>assert.equal(H.RELEASE,'2.3.3'));
test('reads household snapshot',()=>assert.deepEqual(H.snapshot(household),{left:2250,limit:3000}));
test('formats remaining household budget',()=>assert.equal(H.summary(household,n=>n.toLocaleString('en-US')),'متبقي مصروف البيت اليوم: 2,250 من 3,000 ر.ي'));
test('exhausted household budget is explicit',()=>assert.equal(H.summary(exhausted),'نفد مصروف البيت لليوم'));
test('ordinary payment is ignored',()=>assert.equal(H.summary({kind:'pay',receipt:{householdLeft:10,householdLimit:100}}),''));
test('legacy receipt without household snapshot is ignored',()=>assert.equal(H.summary({kind:'householdPay',receipt:{}}),''));
test('invalid remaining greater than limit is ignored',()=>assert.equal(H.summary({kind:'householdPay',receipt:{householdLeft:4000,householdLimit:3000}}),''));
test('negative values are clamped without exposing invalid balances',()=>assert.deepEqual(H.snapshot({kind:'householdPay',receipt:{householdLeft:-5,householdLimit:3000}}),{left:0,limit:3000}));
console.log(count+' household-message summary checks passed.');
