/* WaslPay 2.3.7 — idempotent household message rendering; no payment logic changes. */
'use strict';
const WaslHouseholdMessage237=(()=>{
 const RELEASE='2.3.7';
 function snapshot(tx){
  const r=tx&&tx.kind==='householdPay'&&tx.receipt;
  if(!r||!Number.isSafeInteger(r.householdLeft)||!Number.isSafeInteger(r.householdLimit))return null;
  const left=r.householdLeft,limit=r.householdLimit;
  if(left<0||limit<=0||limit<left)return null;
  return {left,limit};
 }
 function status(tx){
  const s=snapshot(tx);if(!s)return null;
  if(s.left===0)return {level:'exhausted',left:s.left,limit:s.limit,percent:0};
  const ratio=s.left/s.limit,percent=Math.max(0,Math.min(100,Math.round(ratio*100)));
  if(ratio<=0.2)return {level:'low',left:s.left,limit:s.limit,percent};
  return {level:'normal',left:s.left,limit:s.limit,percent};
 }
 function summary(tx,money=n=>String(n)){
  const s=status(tx);if(!s)return '';
  if(s.level==='exhausted')return 'نفد مصروف البيت لليوم';
  if(s.level==='low')return 'تنبيه: بقي '+s.percent+'٪ من مصروف البيت اليوم · المتبقي '+money(s.left)+' من '+money(s.limit)+' ر.ي';
  return 'متبقي مصروف البيت اليوم: '+money(s.left)+' من '+money(s.limit)+' ر.ي';
 }
 function read(D,storage=localStorage){
  try{const state=JSON.parse(storage.getItem(D.KEY));return state&&state.schema===2&&Array.isArray(state.tx)?state:null;}catch(_){return null;}
 }
 function txById(state,id){return state&&id?(state.tx||[]).find(t=>t.id===id):null;}
 function setText(el,value){
  if(!el)return false;value=String(value);
  if(el.textContent===value)return false;
  el.textContent=value;return true;
 }
 function setClass(el,value){
  if(!el)return false;
  if(el.className===value)return false;
  el.className=value;return true;
 }
 function applyLevel(el,st){
  if(!el)return;
  el.classList.remove('low','exhausted');
  if(st&&st.level!=='normal')el.classList.add(st.level);
 }
 function enhanceCards(root,state,D){
  root.querySelectorAll('#messagesBody .message-card[data-id]').forEach(card=>{
   const tx=txById(state,card.dataset.id),text=summary(tx,D.money),st=status(tx);
   let n=card.querySelector('[data-household-message-summary]');
   if(!text){if(n)n.remove();return;}
   if(!n){n=root.createElement?root.createElement('span'):document.createElement('span');n.dataset.householdMessageSummary='1';card.appendChild(n);}
   setClass(n,'message-meta household-message-summary');setText(n,text);applyLevel(n,st);
  });
 }
 function enhanceDetail(root,state,D){
  const body=root.getElementById&&root.getElementById('messagesBody'),article=body&&body.querySelector('.message-detail');if(!article)return;
  const ref=[...article.querySelectorAll('dl>div')].find(n=>n.querySelector('dt')&&n.querySelector('dt').textContent.trim()==='رقم العملية');
  const id=ref&&ref.querySelector('dd')&&ref.querySelector('dd').textContent.trim(),tx=txById(state,id),text=summary(tx,D.money),st=status(tx);
  let n=article.querySelector('[data-household-message-detail]');
  if(!text){if(n)n.remove();return;}
  if(!n){n=root.createElement?root.createElement('p'):document.createElement('p');n.dataset.householdMessageDetail='1';article.appendChild(n);}
  setClass(n,'household-message-detail');setText(n,text);applyLevel(n,st);
 }
 function enhanceLive(root,state,D){
  const live=root.getElementById&&root.getElementById('paymentLive'),open=root.getElementById&&root.getElementById('paymentLiveOpen'),text=root.getElementById&&root.getElementById('paymentLiveText');
  if(!live||!open||!text||live.hidden)return;
  const tx=txById(state,open.dataset.id),extra=summary(tx,D.money),st=status(tx);
  if(extra&&!text.textContent.includes(extra))setText(text,text.textContent+' · '+extra);
  live.classList.remove('household-low','household-exhausted');
  if(st&&st.level==='low')live.classList.add('household-low');
  if(st&&st.level==='exhausted')live.classList.add('household-exhausted');
 }
 function stamp(root){
  const title=root.getElementById&&root.getElementById('dialogTitle'),body=root.getElementById&&root.getElementById('dialogBody');
  if(!title||!body||title.textContent.trim()!=='ما الجديد في وَصْل؟')return;
  const badge=body.querySelector('.community-badge');if(badge)setText(badge,'2.3.7 · الخميس 24 سبتمبر 2026');
  if(!body.querySelector('[data-release-237]')){
   const p=root.createElement?root.createElement('p'):document.createElement('p');p.dataset.release237='1';
   p.textContent='إصلاح اليوم: شريط المعاينة العلوي يحترم الآن مساحة الأمان اليمنى واليسرى كلًّا على حدة، لتقليل احتمال اقتراب النص من فتحة الشاشة أو الحواف في وضع iPhone الأفقي.';
   const h=body.querySelector('h3');if(h)h.insertAdjacentElement('afterend',p);else body.prepend(p);
  }
 }
 function enhance(root=document,storage=localStorage){
  const D=globalThis.Wasl;if(!D)return null;const state=read(D,storage);if(!state)return null;
  enhanceCards(root,state,D);enhanceDetail(root,state,D);enhanceLive(root,state,D);stamp(root);return state;
 }
 return {RELEASE,snapshot,status,summary,read,txById,setText,setClass,applyLevel,enhanceCards,enhanceDetail,enhanceLive,stamp,enhance};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=WaslHouseholdMessage237;
if(typeof document!=='undefined'){
 const run=()=>WaslHouseholdMessage237.enhance();
 new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('click',()=>queueMicrotask(run));
 window.addEventListener('storage',run);run();
}
