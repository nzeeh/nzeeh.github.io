'use strict';
const assert=require('node:assert/strict');
const H=require('../household-message-summary-2.3.7.js');
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS '+name)};
const money=n=>Number(n).toLocaleString('en-US');
const tx=(left,limit,kind='householdPay')=>({id:'t1',kind,receipt:{householdLeft:left,householdLimit:limit}});
test('release is 2.3.7',()=>assert.equal(H.RELEASE,'2.3.7'));
test('non-household transaction is ignored',()=>assert.equal(H.status(tx(100,1000,'familyPay')),null));
test('missing receipt snapshot is ignored',()=>assert.equal(H.status({kind:'householdPay'}),null));
test('invalid negative snapshot is ignored',()=>assert.equal(H.status({kind:'householdPay',receipt:{householdLeft:-1,householdLimit:1000}}),null));
test('left above limit is ignored',()=>assert.equal(H.status(tx(1200,1000)),null));
test('zero or missing limit is ignored',()=>assert.equal(H.status(tx(0,0)),null));
test('above 20 percent remains normal',()=>assert.equal(H.status(tx(210,1000)).level,'normal'));
test('exactly 20 percent becomes low',()=>assert.deepEqual(H.status(tx(200,1000)),{level:'low',left:200,limit:1000,percent:20}));
test('zero is exhausted',()=>assert.deepEqual(H.status(tx(0,1000)),{level:'exhausted',left:0,limit:1000,percent:0}));
test('normal summary preserved',()=>assert.equal(H.summary(tx(700,3000),money),'متبقي مصروف البيت اليوم: 700 من 3,000 ر.ي'));
test('low summary preserved',()=>assert.equal(H.summary(tx(500,3000),money),'تنبيه: بقي 17٪ من مصروف البيت اليوم · المتبقي 500 من 3,000 ر.ي'));
test('exhausted summary preserved',()=>assert.equal(H.summary(tx(0,3000),money),'نفد مصروف البيت لليوم'));
test('setText writes once then becomes idempotent',()=>{
 let value='';let writes=0;const el={get textContent(){return value},set textContent(v){writes++;value=v}};
 assert.equal(H.setText(el,'نص'),true);assert.equal(H.setText(el,'نص'),false);assert.equal(writes,1);
});
test('setClass writes once then becomes idempotent',()=>{
 let value='';let writes=0;const el={get className(){return value},set className(v){writes++;value=v}};
 assert.equal(H.setClass(el,'a b'),true);assert.equal(H.setClass(el,'a b'),false);assert.equal(writes,1);
});
console.log('\n'+count+' household-message tests passed.');
