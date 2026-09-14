'use strict';
// Unit tests with mocked network/cache. This is not a device installation test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const target=process.argv[2]||path.resolve(__dirname,'../sw.js');
const source=fs.readFileSync(target,'utf8'),cacheName=source.match(/const CACHE='([^']+)'/)[1];
const handlers={},deleted=[],items=new Map();let claimed=false,skipped=false,network=true,count=0;
const cache={
 async addAll(reqs){for(const r of reqs)items.set(r.url,new Response(r.url.endsWith('index.html')?'OFFLINE_DEMO':'STATIC'));},
 async match(req,opts={}){const u=typeof req==='string'?req:req.url;for(const [k,v]of items)if(k===u||(opts.ignoreSearch&&k.split('?')[0]===u.split('?')[0]))return v.clone();}
};
const context={URL,Request,Response,Set,console,self:{location:{href:'https://nzeeh.github.io/waslpay/sw.js'},addEventListener:(n,f)=>handlers[n]=f,clients:{claim:async()=>{claimed=true;}},skipWaiting:async()=>{skipped=true;}},caches:{open:async()=>cache,keys:async()=>['unrelated-property-site','waslpay-demo-shell-old','waslpay-demo-shell-2.1.0',cacheName],delete:async n=>{deleted.push(n);}},fetch:async()=>{if(!network)throw Error('Offline');return new Response('NETWORK');}};
vm.runInNewContext(source,context);
const fetchEvent=(url,{mode='cors',method='GET',headers={},cache='default'}={})=>{let out;handlers.fetch({request:{url,mode,method,headers:new Headers(headers),cache},respondWith:p=>out=p});return out||null;};
const base='https://nzeeh.github.io/waslpay/';
function test(name,fn){fn();console.log('PASS '+name);count++;}
(async()=>{
 let pending;handlers.install({waitUntil:p=>pending=p});await pending;
 if(process.argv.includes('--probe')){
  const stale=await fetchEvent(base+'responsive-2.1.css?v=FUTURE');
  console.log('Future-version request intercepted:',!!stale,'body:',stale?await stale.text():'NETWORK BYPASS');return;
 }
 test('Precache contains all 10 explicit public assets',()=>assert.equal(items.size,10));
 test('Installation never forces activation',()=>assert.equal(skipped,false));
 handlers.activate({waitUntil:p=>pending=p});await pending;
 test('Old WaslPay caches cleaned without touching property site',()=>assert.deepEqual(deleted,['waslpay-demo-shell-old','waslpay-demo-shell-2.1.0']));
 test('New worker claims clients after activation',()=>assert.equal(claimed,true));
 network=false;
 const offline=await (await fetchEvent(base+'?v=2.1.1',{mode:'navigate'})).text();
 test('Offline deep-link query opens cached demo shell',()=>assert.equal(offline,'OFFLINE_DEMO'));
 const index=await (await fetchEvent(base+'index.html?source=home',{mode:'navigate'})).text();
 test('Offline index navigation preserves fallback',()=>assert.equal(index,'OFFLINE_DEMO'));
 const css=await (await fetchEvent(base+'responsive-2.1.css?v=2.1.0')).text();
 test('Exact existing CSS version remains available offline',()=>assert.equal(css,'STATIC'));
 test('Future CSS version is NEVER replaced by stale version',()=>assert.equal(fetchEvent(base+'responsive-2.1.css?v=FUTURE'),null));
 test('Future script version is NEVER replaced by stale version',()=>assert.equal(fetchEvent(base+'family-v2.js?v=FUTURE'),null));
 test('Unversioned asset bypasses versioned cache',()=>assert.equal(fetchEvent(base+'family-v2.js'),null));
 test('Other project navigation is untouched',()=>assert.equal(fetchEvent('https://nzeeh.github.io/property/',{mode:'navigate'}),null));
 test('Payment API traffic is untouched',()=>assert.equal(fetchEvent(base+'api/payment'),null));
 test('POST requests are never cached',()=>assert.equal(fetchEvent(base,{mode:'navigate',method:'POST'}),null));
 test('Cross-origin traffic is never cached',()=>assert.equal(fetchEvent('https://example.org/waslpay/'),null));
 test('Authorization headers bypass public cache',()=>assert.equal(fetchEvent(base+'icons/icon-192.png',{headers:{Authorization:'Bearer test'}}),null));
 test('Explicit no-store requests bypass public cache',()=>assert.equal(fetchEvent(base+'icons/icon-192.png',{cache:'no-store'}),null));
 network=true;const fresh=await (await fetchEvent(base,{mode:'navigate'})).text();
 test('Online navigation requests fresh HTML',()=>assert.equal(fresh,'NETWORK'));
 handlers.message({data:{type:'OTHER'},waitUntil:p=>pending=p});
 test('Unrelated messages do not activate update',()=>assert.equal(skipped,false));
 handlers.message({data:{type:'ACTIVATE_UPDATE'},waitUntil:p=>pending=p});await pending;
 test('Explicit update message activates worker',()=>assert.equal(skipped,true));
 console.log('\n'+count+' mocked service-worker tests passed.');
})().catch(e=>{console.error(e);process.exit(1);});
