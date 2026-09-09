/* Cache public demo UI only; NEVER cache bank/API traffic or queue payments. */
'use strict';
const CACHE='waslpay-demo-shell-2.1.0';
const ROOT=new URL('./',self.location.href);
const FILES=['./','index.html','family-v2.css?v=2.0.0','family-v2.js?v=2.0.0','responsive-2.1.css?v=2.1.0','platform-2.1.js?v=2.1.0','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const urls=FILES.map(p=>new URL(p,ROOT).href);
const paths=new Set(urls.map(u=>new URL(u).pathname));
self.addEventListener('install',ev=>{ev.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls.map(u=>new Request(u,{cache:'reload'})))));});
self.addEventListener('activate',ev=>{ev.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('waslpay-demo-shell-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})());});
self.addEventListener('message',ev=>{if(ev.data&&ev.data.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',ev=>{
 const req=ev.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==ROOT.origin||!paths.has(url.pathname))return;
 ev.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(req.mode==='navigate'){
   try{const response=await fetch(req);if(response.ok)return response;}catch(_){}
   return await cache.match(new URL('index.html',ROOT).href) || Response.error();
  }
  const saved=await cache.match(req,{ignoreSearch:true});if(saved)return saved;
  return fetch(req);
 })());
});
