/* WaslPay 2.3.3 — clarify household-budget messages without changing payment logic. */
'use strict';
const WaslHouseholdMessage233=(()=>{
 const RELEASE='2.3.3';
 function snapshot(tx){
  const r=tx&&tx.kind==='householdPay'&&tx.receipt;
  if(!r||!Number.isFinite(r.householdLeft)||!Number.isFinite(r.householdLimit))return null;
  const left=Math.max(0,Math.trunc(r.householdLeft)),limit=Math.max(0,Math.trunc(r.householdLimit));
  if(limit<left)return null;
  return {left,limit};
 }
 function summary(tx,money=n=>String(n)){
  const s=snapshot(tx);if(!s)return '';
  return s.left===0?'نفد مصروف البيت لليوم':'متبقي مصروف البيت اليوم: '+money(s.left)+' من '+money(s.limit)+' ر.ي';
 }
 function read(D,storage=localStorage){
  try{const state=JSON.parse(storage.getItem(D.KEY));return state&&state.schema===2&&Array.isArray(state.tx)?state:null;}catch(_){return null;}
 }
 function txById(state,id){return state&&id?(state.tx||[]).find(t=>t.id===id):null;}
 function enhanceCards(root,state,D){
  root.querySelectorAll('#messagesBody .message-card[data-id]').forEach(card=>{
   if(card.querySelector('[data-household-message-summary]'))return;
   const text=summary(txById(state,card.dataset.id),D.money);if(!text)return;
   const n=root.createElement?root.createElement('span'):document.createElement('span');
   n.className='message-meta';n.dataset.householdMessageSummary='1';n.textContent=text;card.appendChild(n);
  });
 }
 function enhanceLive(root,state,D){
  const live=root.getElementById&&root.getElementById('paymentLive'),open=root.getElementById&&root.getElementById('paymentLiveOpen'),text=root.getElementById&&root.getElementById('paymentLiveText');
  if(!live||!open||!text||live.hidden)return;
  const extra=summary(txById(state,open.dataset.id),D.money);if(extra&&!text.textContent.includes(extra))text.textContent=text.textContent+' · '+extra;
 }
 function stamp(root){
  const title=root.getElementById&&root.getElementById('dialogTitle'),body=root.getElementById&&root.getElementById('dialogBody');
  if(!title||!body||title.textContent.trim()!=='ما الجديد في وَصْل؟')return;
  const badge=body.querySelector('.community-badge');if(badge)badge.textContent='2.3.3 · الأحد 20 سبتمبر 2026';
  if(!body.querySelector('[data-release-233]')){
   const p=root.createElement?root.createElement('p'):document.createElement('p');p.dataset.release233='1';
   p.textContent='تحسين اليوم: رسائل مشتريات البيت تعرض الآن المتبقي من الميزانية اليومية مباشرة في بطاقة الرسالة والتنبيه الفوري، حتى يعرف المشتري وصاحب المحفظة وضع مصروف البيت دون فتح التفاصيل.';
   const h=body.querySelector('h3');if(h)h.insertAdjacentElement('afterend',p);else body.prepend(p);
  }
 }
 function enhance(root=document,storage=localStorage){
  const D=globalThis.Wasl;if(!D)return null;const state=read(D,storage);if(!state)return null;
  enhanceCards(root,state,D);enhanceLive(root,state,D);stamp(root);return state;
 }
 return {RELEASE,snapshot,summary,read,txById,enhanceCards,enhanceLive,stamp,enhance};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=WaslHouseholdMessage233;
if(typeof document!=='undefined'){
 const run=()=>WaslHouseholdMessage233.enhance();
 new MutationObserver(run).observe(document.body,{childList:true,subtree:true,characterData:true});
 document.addEventListener('click',()=>queueMicrotask(run));
 window.addEventListener('storage',run);run();
}
