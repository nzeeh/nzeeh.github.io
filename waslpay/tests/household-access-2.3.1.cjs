'use strict';
const assert=require('node:assert/strict');
const G=require('../household-access-2.3.1.js');
const D={periodKey:()=> '2026-09-18'};
const C={model:(_D,s)=>({house:Object.assign({enabled:true,members:[]},s.community&&s.community.house)})};
const base=()=>({schema:2,members:[
 {id:'a1',role:'adult',active:true},{id:'a2',role:'adult',active:false},{id:'c1',role:'child',active:true}
],community:{house:{enabled:true,members:['a1','a2']}}});
let n=0;function t(name,fn){fn();console.log('PASS '+name);n++;}
t('release is 2.3.1',()=>assert.equal(G.RELEASE,'2.3.1'));
t('owner allowed when household budget enabled',()=>assert.deepEqual(G.access(D,C,base(),''),{allowed:true,owner:true,reason:'owner'}));
t('delegated active adult allowed',()=>assert.equal(G.access(D,C,base(),'a1').reason,'delegated'));
t('paused adult blocked',()=>assert.equal(G.access(D,C,base(),'a2').reason,'paused'));
t('child blocked even if otherwise active',()=>assert.equal(G.access(D,C,base(),'c1').reason,'child'));
t('undelegated adult blocked',()=>{const s=base();s.members.push({id:'a3',role:'adult',active:true});assert.equal(G.access(D,C,s,'a3').reason,'notDelegated');});
t('missing member blocked',()=>assert.equal(G.access(D,C,base(),'missing').reason,'missing'));
t('disabled household budget blocks member and owner payment',()=>{const s=base();s.community.house.enabled=false;assert.equal(G.access(D,C,s,'a1').reason,'disabled');assert.equal(G.access(D,C,s,'').allowed,false);});
console.log(n+' household-access checks passed.');
