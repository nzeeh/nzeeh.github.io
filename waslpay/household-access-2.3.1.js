/* WaslPay 2.3.1: UI guard for delegated household spending in member preview. */
'use strict';
const WaslHouseholdAccess231=(()=>{
 const RELEASE='2.3.1';
 function access(D,C,state,memberId){
  const h=C.model(D,state).house;
  if(!memberId)return {allowed:!!h.enabled,owner:true,reason:h.enabled?'owner':'disabled'};
  const m=(state.members||[]).find(x=>x.id===memberId);
  if(!h.enabled)return {allowed:false,owner:false,reason:'disabled'};
  if(!m)return {allowed:false,owner:false,reason:'missing'};
  if(m.role!=='adult')return {allowed:false,owner:false,reason:'child'};
  if(!m.active)return {allowed:false,owner:false,reason:'paused'};
  if(!h.members.includes(m.id))return {allowed:false,owner:false,reason:'notDelegated'};
  return {allowed:true,owner:false,reason:'delegated'};
 }
 function scope(root=document){
  const screen=root.getElementById&&root.getElementById('screen');
  const b=screen&&screen.querySelector('[data-action="memberPay"]');
  return b?b.dataset.id:'';
 }
 function read(D,storage=localStorage){
  try{const s=JSON.parse(storage.getItem(D.KEY));return s&&s.schema===2&&Array.isArray(s.members)?s:null;}catch(_){return null;}
 }
 const copy={
  child:'مصروف البيت متاح للبالغين المفوضين فقط. لا يؤثر هذا في مصروفك الشخصي.',
  paused:'الصرف من مصروف البيت موقوف لهذا الفرد حاليًا.',
  notDelegated:'هذا الفرد غير مفوض بالصرف من مصروف البيت. يمكن لصاحب المحفظة تعديل التفويض من إعداد مصروف البيت.',
  missing:'تعذر التحقق من تفويض هذا الفرد. لم تُغيّر البيانات.',
  disabled:'مصروف البيت غير مفعّل حاليًا.'
 };
 function notice(body,text){
  if(body.querySelector('[data-household-access-note]'))return;
  const n=document.createElement('div');n.className='community-info';n.dataset.householdAccessNote='1';n.textContent=text;body.appendChild(n);
 }
 function guard(root=document,storage=localStorage){
  const title=root.getElementById&&root.getElementById('dialogTitle'),body=root.getElementById&&root.getElementById('dialogBody');
  if(!title||!body||title.textContent.trim()!=='مصروف البيت')return null;
  const memberId=scope(root);if(!memberId)return {allowed:true,owner:true,reason:'owner'};
  const D=globalThis.Wasl,C=globalThis.WaslCommunity230;if(!D||!C)return null;
  const s=read(D,storage);if(!s)return null;
  const a=access(D,C,s,memberId),pay=body.querySelector('[data-community="housePay"]');
  if(!a.allowed&&pay){pay.remove();notice(body,copy[a.reason]||copy.notDelegated);}
  return a;
 }
 function stamp(root=document){
  const title=root.getElementById&&root.getElementById('dialogTitle'),body=root.getElementById&&root.getElementById('dialogBody');
  if(!title||!body||title.textContent.trim()!=='ما الجديد في وَصْل؟')return;
  const badge=body.querySelector('.community-badge');
  if(badge&&badge.textContent.includes('2.3.0'))badge.textContent='2.3.1 · الجمعة 18 سبتمبر 2026';
  if(!body.querySelector('[data-release-231]')){
   const p=document.createElement('p');p.dataset.release231='1';p.textContent='تحسين اليوم: حساب الفرد لا يعرض زر الشراء من مصروف البيت إلا إذا كان بالغًا، نشطًا، ومفوّضًا من صاحب المحفظة. هذا يمنع مسارًا مربكًا كان ينتهي برفض العملية بعد إدخال بياناتها.';
   const h=body.querySelector('h3');if(h)h.insertAdjacentElement('afterend',p);else body.prepend(p);
  }
 }
 function enhance(){guard();stamp();}
 return {RELEASE,access,scope,guard,stamp,enhance};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=WaslHouseholdAccess231;
if(typeof document!=='undefined'){
 const run=()=>WaslHouseholdAccess231.enhance();
 const body=document.getElementById('dialogBody');if(body)new MutationObserver(run).observe(body,{childList:true,subtree:true});
 document.addEventListener('click',ev=>{
  const b=ev.target.closest&&ev.target.closest('[data-community="housePay"]');if(!b)return;
  const a=WaslHouseholdAccess231.guard();if(a&&!a.allowed){ev.preventDefault();ev.stopImmediatePropagation();}
 },true);
 run();
}
