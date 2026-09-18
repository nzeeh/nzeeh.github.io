/* Cache public demo UI only; NEVER cache bank/API traffic or queue payments. */
'use strict';
const CACHE='waslpay-demo-shell-2.3.2';
const ROOT=new URL('./',self.location.href);
const FILES=['./','index.html','family-v2.css?v=2.0.0','family-v2.js?v=2.0.0','responsive-2.1.css?v=2.1.0','platform-2.1.1.js?v=2.1.1','money-input-2.1.2.js?v=2.1.2','messages-2.2.js?v=2.2.0','messages-2.2.css?v=2.2.0','spend-guard-2.2.1.js?v=2.2.1','spend-guard-2.2.1.css?v=2.2.1','community-start-2.3.js?v=2.3.0','community-domain-2.3.js?v=2.3.0','community-ui-2.3.js?v=2.3.0','community-2.3.css?v=2.3.0','household-access-2.3.1.js?v=2.3.1','accessibility-2.3.2.js?v=2.3.2','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const urls=FILES.map(p=>new URL(p,ROOT).href);
const allowed=new Set(urls);
const documents=new Set([ROOT.pathname,new URL('index.html',ROOT).pathname]);
self.addEventListener('install',ev=>{ev.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls.map(u=>new Request(u,{cache:'reload'})))));});
self.addEventListener('activate',ev=>{ev.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('waslpay-demo-shell-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})());});
self.addEventListener('message',ev=>{if(ev.data&&ev.data.type==='ACTIVATE_UPDATE')ev.waitUntil(self.skipWaiting());});
self.addEventListener('fetch',ev=>{
 const req=ev.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==ROOT.origin||req.headers.has('Authorization')||req.cache==='no-store')return;
 const navigation=req.mode==='navigate'&&documents.has(url.pathname);
 if(!navigation&&!allowed.has(url.href))return;
 ev.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(navigation){
   try{const response=await fetch(req,{cache:'no-cache'});if(response.ok)return response;}catch(_){}
   return await cache.match(new URL('index.html',ROOT).href) || Response.error();
  }
  const saved=await cache.match(req);if(saved)return saved;
  return fetch(req);
 })());
});
