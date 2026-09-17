/* WaslPay 2.2.1: read-only allowance warnings for family-payment messages. */
'use strict';
const WaslSpendGuard221=(()=>{
 const RELEASE='2.2.1';
 function status(tx,state){
  if(!tx||tx.kind!=='familyPay'||!tx.receipt)return null;
  const member=(state&&Array.isArray(state.members)?state.members:[]).find(m=>m.id===tx.memberId);
  const left=Number(tx.receipt.allowanceLeft);
  if(!Number.isFinite(left)||left<0)return null;
  let total=Number(tx.receipt.allowanceTotal);
  if(!Number.isFinite(total)||total<=0)total=null;
  if(left===0)return {level:'exhausted',left,total,percent:0,text:'نفد المخصص بعد هذه العملية'};
  if(total){
   const ratio=left/total,percent=Math.max(0,Math.min(100,Math.round(ratio*100)));
   if(ratio<=0.2)return {level:'low',left,total,percent,text:'تنبيه: بقي '+percent+'٪ فقط من المخصص'};
  }
  return null;
 }
 function stamp(next){
  if(!next||!Array.isArray(next.tx)||!Array.isArray(next.members))return next;
  next.tx.forEach(t=>{
   if(t&&t.kind==='familyPay'&&t.receipt&&(!Number.isFinite(t.receipt.allowanceTotal)||t.receipt.allowanceTotal<=0)){
    const m=next.members.find(x=>x.id===t.memberId);
    if(m){const total=Number(m.limit)+Number(m.extra);if(Number.isFinite(total)&&total>0)t.receipt.allowanceTotal=total;}
   }
  });
  return next;
 }
 return {RELEASE,status,stamp};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=WaslSpendGuard221;
if(typeof document!=='undefined'&&typeof Wasl!=='undefined')(()=>{
 const G=WaslSpendGuard221,D=Wasl,$=id=>document.getElementById(id);
 let state=null;
 function load(){try{const s=JSON.parse(localStorage.getItem(D.KEY));if(s&&s.schema===2&&Array.isArray(s.tx)&&Array.isArray(s.members))state=s;}catch(_){}return state;}
 const execute=D.execute;
 D.execute=function(s,action,payload){return G.stamp(execute(s,action,payload));};
 function currentTx(id){const s=load();return s&&s.tx.find(t=>t.id===id);}
 function makeNote(st){
  const el=document.createElement('span');el.className='spend-guard '+st.level;
  el.textContent=st.text+(st.left>=0?' · المتبقي '+D.money(st.left)+' ر.ي':'');
  return el;
 }
 function enhance(){
  const s=load();if(!s)return;
  document.querySelectorAll('.message-card[data-id]').forEach(card=>{
   const t=s.tx.find(x=>x.id===card.dataset.id),st=G.status(t,s),old=card.querySelector('.spend-guard');
   const text=st?st.text+' · المتبقي '+D.money(st.left)+' ر.ي':'';
   if(!st&&old)old.remove();else if(st&&(!old||old.textContent!==text||!old.classList.contains(st.level))){if(old)old.remove();card.appendChild(makeNote(st));}
  });
  const body=$('messagesBody');if(body){
   const article=body.querySelector('.message-detail');
   if(article){let t=null;const ref=[...article.querySelectorAll('dl>div')].find(n=>n.querySelector('dt')&&n.querySelector('dt').textContent.trim()==='رقم العملية');const id=ref&&ref.querySelector('dd')&&ref.querySelector('dd').textContent.trim();if(id)t=s.tx.find(x=>x.id===id);
    const old=article.querySelector('.spend-guard-detail'),st=G.status(t,s),text=st?st.text+' · المتبقي '+D.money(st.left)+' ر.ي':'';if(!st&&old)old.remove();else if(st&&(!old||old.textContent!==text||!old.classList.contains(st.level))){if(old)old.remove();const note=makeNote(st);note.classList.add('spend-guard-detail');article.appendChild(note);}
   }
  }
  const live=$('paymentLive'),open=$('paymentLiveOpen');if(live&&open&&!live.hidden){const st=G.status(currentTx(open.dataset.id),s),old=live.querySelector('.spend-guard-live'),text=st?st.text+' · المتبقي '+D.money(st.left)+' ر.ي':'';if(!st&&old)old.remove();else if(st&&(!old||old.textContent!==text||!old.classList.contains(st.level))){if(old)old.remove();const note=makeNote(st);note.classList.add('spend-guard-live');live.insertBefore(note,open);}}
  document.querySelectorAll('.foot-note').forEach(n=>{if((n.textContent||'').includes('2.2.0'))n.innerHTML=n.innerHTML.replace(/2\.2\.0/g,G.RELEASE);});
 }
 const obs=new MutationObserver(enhance);obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','data-id']});
 window.addEventListener('storage',ev=>{if(ev.key===D.KEY)enhance();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)enhance();});
 enhance();
})();
