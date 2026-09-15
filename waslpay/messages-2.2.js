/* WaslPay 2.2: local demo messages, not bank confirmations or remote push.
 * Receipt snapshots are attached to the existing transaction BEFORE its normal
 * single localStorage write. Read flags are separate; money is never reposted.
 */
'use strict';
const WaslMessages220=(()=>{
 const labels={pay:'دفع للتاجر',payment:'دفع',familyPay:'دفع من مصروف الأسرة',giftPay:'دفع من العسب',send:'تحويل',withdraw:'سحب نقدي',service:'سداد خدمة',deposit:'إيداع',giftHold:'حجز عسب',giftOpen:'فتح عسب',giftReturn:'إلغاء حجز العسب',goalHold:'تخصيص للادخار',goalReturn:'إعادة من الادخار'};
 function decorate(before,next,action,payload){
  const known=new Set((before.tx||[]).map(t=>t.id));
  (next.tx||[]).filter(t=>!known.has(t.id)).forEach(t=>{
   const m=next.members.find(x=>x.id===t.memberId),gift=t.kind==='giftPay';
   const source=gift?'رصيد العسب الخاص':t.kind==='familyPay'?'الرصيد المشترك · مخصص الأسرة':t.kind==='giftOpen'?'حجز العسب السابق':t.kind==='goalReturn'?'المدخر للهدف':t.kind==='giftReturn'?'حجز الظرف السابق':t.kind==='deposit'?'إيداع نقدي تجريبي':'رصيد صاحب المحفظة';
   const fee=t.kind==='withdraw'?100:0;
   t.receipt={version:1,payer:m?m.name:'صاحب المحفظة',memberId:t.memberId||'',target:payload.merchant||t.title,type:labels[t.kind]||'حركة محفظة',status:'مسجلة تجريبيًا',source,walletAfter:next.wallet,sourceAfter:gift?m.giftBalance:next.wallet,allowanceLeft:m?Math.max(0,m.limit+m.extra-m.spent):null,period:m?m.period:null,category:payload.category||null,fee,principal:Math.max(0,Math.abs(t.amount)-fee)};
  });
  return next;
 }
 function rows(state,scope='owner',filter='all',read={}){
  const seen=new Set(),flags=new Set(Array.isArray(read[scope])?read[scope]:[]);
  return (state.tx||[]).filter(t=>{
   if(!t||typeof t.id!=='string'||seen.has(t.id))return false;seen.add(t.id);
   if(scope!=='owner'&&t.memberId!==scope)return false;
   return filter==='unread'?!flags.has(t.id):filter==='self'?!t.memberId:filter==='family'?!!t.memberId:true;
  });
 }
 function mark(read,scope,ids){return {...read,[scope]:[...new Set([...(Array.isArray(read[scope])?read[scope]:[]),...ids])]};}
 return {labels,decorate,rows,mark};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=WaslMessages220;
if(typeof document!=='undefined'&&typeof Wasl!=='undefined')(()=>{
 const D=Wasl,M=WaslMessages220,$=id=>document.getElementById(id),e=D.escape;
 const READ_KEY=D.KEY+'-message-reads-v1';
 let current={schema:2,tx:[],members:[]},read={},durable=true,filter='all',limit=25,selected=null,previousScope='owner';
 function load(){try{const s=JSON.parse(localStorage.getItem(D.KEY));if(s&&s.schema===2&&Array.isArray(s.tx)&&Array.isArray(s.members))current=s;}catch(_){durable=false;}}
 function loadRead(){try{const r=JSON.parse(localStorage.getItem(READ_KEY));read=r&&typeof r==='object'&&!Array.isArray(r)?r:{};}catch(_){read={};durable=false;}}
 load();loadRead();const announced=new Set(current.tx.map(t=>t.id));
 const scope=()=>{const b=$('screen').querySelector('[data-action="memberPay"]');return b?b.dataset.id:'owner';};
 const title=t=>t.receipt?t.receipt.payer:(current.members.find(m=>m.id===t.memberId)||{}).name||(t.memberId?'فرد الأسرة':'صاحب المحفظة');
 const money=n=>D.money(n)+' ر.ي';
 const when=t=>new Intl.DateTimeFormat('ar-YE',{timeZone:'Asia/Aden',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(t.at));
 const visible=(f=filter)=>M.rows(current,scope(),f,read);
 function savedMark(ids){read=M.mark(read,scope(),ids);try{localStorage.setItem(READ_KEY,JSON.stringify(read));}catch(_){durable=false;}badge();}
 function badge(){const n=visible('unread').length,b=$('messageCount');b.textContent=n>99?'99+':String(n);b.hidden=!n;$('messageTrigger').setAttribute('aria-label','الرسائل'+(n?'، '+n+' غير مقروءة':''));}
 const row=(label,value)=>'<div><dt>'+e(label)+'</dt><dd>'+e(value)+'</dd></div>';
 function detail(t){
  const r=t.receipt,owner=scope()==='owner';
  let data=row('اسم الدافع / صاحب الحركة',title(t))+row('الجهة / تفاصيل الحركة',r?r.target:t.title)+row('النوع',r?r.type:M.labels[t.kind]||'حركة محفظة')+row('المبلغ المسجل',money(Math.abs(t.amount)))+row('الحالة','مسجلة تجريبيًا')+row('التاريخ والوقت',when(t)+' · بتوقيت اليمن')+row('رقم العملية',t.id);
  if(r){data+=row('مصدر المبلغ',r.source);if(r.fee)data+=row('المبلغ قبل الرسم',money(r.principal))+row('الرسم التجريبي المشمول',money(r.fee));if(r.category)data+=row('فئة الإنفاق',D.categories[r.category]||r.category);if(owner)data+=row('المتاح في المحفظة بعد هذه الحركة',money(r.walletAfter));if(t.kind==='giftPay')data+=row('المتبقي من العسب بعد الدفع',money(r.sourceAfter));if(r.allowanceLeft!==null)data+=row('المتبقي من المخصص '+(D.periods[r.period]||''),money(r.allowanceLeft));}
  return '<button type="button" class="secondary" data-inbox="back">العودة إلى الرسائل</button><article class="message-detail"><span class="message-status">✓ مسجلة تجريبيًا</span><h3>'+e(r?r.type:M.labels[t.kind]||'حركة محفظة')+'</h3><strong class="message-total" dir="auto">'+e(money(Math.abs(t.amount)))+'</strong><p>'+e(title(t))+'</p><dl>'+data+'</dl></article><p class="hint warn">'+(r?'الأرصدة أعلاه لقطة وقت تسجيل الحركة وليست الرصيد الحالي.':'حركة سابقة محفوظة؛ أرصدة ما بعد الحركة لم تكن مسجلة، لذلك لا نعيد تخمينها.')+' هذه رسالة داخل المعاينة، وليست تأكيدًا مصرفيًا.</p>';
 }
 function draw(){
  badge();if(!$('messagesDialog').open)return;
  const head=$('messagesScope');head.textContent=scope()==='owner'?'مدفوعاتك ومدفوعات الأسرة':'رسائل هذا الفرد فقط · وضع معاينة';
  const item=selected&&visible('all').find(t=>t.id===selected);
  if(item){$('messagesBody').innerHTML=detail(item);return;}
  selected=null;
  const list=visible(),flags=new Set(Array.isArray(read[scope()])?read[scope()]:[]);
  const filters=scope()==='owner'?[['all','الكل'],['self','مدفوعاتي'],['family','الأسرة'],['unread','غير مقروء']]:[['all','الكل'],['unread','غير مقروء']];
  const controls='<div class="message-filters" role="group" aria-label="تصفية الرسائل">'+filters.map(([key,label])=>'<button type="button" data-inbox="filter" data-value="'+key+'" aria-pressed="'+(filter===key)+'">'+label+'</button>').join('')+'</div><div class="message-tools"><span>'+list.length+' رسالة</span><button type="button" data-inbox="read-all">تعليم المعروض كمقروء</button></div>';
  const cards=list.slice(0,limit).map(t=>'<button type="button" class="message-card '+(!flags.has(t.id)?'unread':'')+'" data-inbox="detail" data-id="'+e(t.id)+'"><span class="message-card-head"><strong>'+e(title(t))+'</strong><b dir="auto">'+e(money(Math.abs(t.amount)))+'</b></span><span class="message-purpose">'+e(t.receipt?t.receipt.type:M.labels[t.kind]||'حركة محفظة')+' · '+e(t.title)+'</span><span class="message-meta">'+e(when(t))+' · '+(!flags.has(t.id)?'جديدة':'مقروءة')+'</span></button>').join('');
  $('messagesBody').innerHTML=controls+(cards||'<div class="empty">'+(filter==='unread'?'قرأت جميع الرسائل.':'لا توجد رسائل هنا بعد. ستظهر فور تسجيل عملية تجريبية.')+'</div>')+(list.length>limit?'<button type="button" class="secondary" data-inbox="more">عرض رسائل أقدم</button>':'')+(scope()==='owner'?'<button type="button" class="secondary message-requests" data-inbox="requests">طلبات زيادة مصروف الأسرة</button>':'')+'<p class="message-privacy">المدفوعات والحجوزات والادخار أنواع مستقلة؛ فتح العسب ليس خصمًا جديدًا. المعاينة لا تتزامن بين هواتف مختلفة.</p>'+(!durable?'<p class="hint warn">تعذر الحفظ في المتصفح؛ قد لا تبقى الرسائل أو حالة القراءة بعد إغلاقه.</p>':'');
 }
 function open(id=null){
  const base=$('dialog');if(base.open&&base.querySelector('form'))return;
  if(base.open)base.close();selected=id;filter='all';limit=25;
  if(id&&visible('all').some(t=>t.id===id))savedMark([id]);
  if(!$('messagesDialog').open)$('messagesDialog').showModal();draw();
 }
 function accept(s,live){
  if(!s||s.schema!==2||!Array.isArray(s.tx)||!Array.isArray(s.members))return;
  current=s;const fresh=s.tx.filter(t=>!announced.has(t.id));fresh.forEach(t=>announced.add(t.id));
  const last=fresh.find(t=>scope()==='owner'||t.memberId===scope());
  badge();draw();
  if(live&&last){
   $('paymentLive').hidden=false;$('paymentLiveText').textContent=(last.receipt?last.receipt.type:'حركة جديدة')+' · '+title(last)+' · '+money(Math.abs(last.amount))+' · '+last.title;
   $('paymentLiveOpen').dataset.id=last.id;
   const receipt=$('dialogBody').querySelector('.receipt');
   if(receipt&&!receipt.querySelector('[data-inbox]')){const ref=receipt.querySelector('.reference');if(ref)ref.textContent='DEMO · '+last.id;const b=document.createElement('button');b.type='button';b.className='secondary';b.dataset.inbox='detail';b.dataset.id=last.id;b.textContent='عرض رسالة العملية بكامل التفاصيل';receipt.appendChild(b);}
  }
 }
 // Wrap only the public pure dispatcher, not the existing budget/payment rules.
 const execute=D.execute;
 D.execute=function(state,action,payload){
  const next=M.decorate(state,execute(state,action,payload),action,payload);
  // Core commit persists synchronously. Notify after that write/render, not before.
  Promise.resolve().then(()=>{
   try{const stored=JSON.parse(localStorage.getItem(D.KEY));durable=!!(stored&&next.tx.every(t=>stored.tx.some(x=>x.id===t.id)));}catch(_){durable=false;}
   accept(next,true);
  });return next;
 };
 document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-inbox]');if(!b)return;
  switch(b.dataset.inbox){
   case 'open':open();break;
   case 'close':$('messagesDialog').close();break;
   case 'detail':open(b.dataset.id);break;
   case 'filter':filter=b.dataset.value;limit=25;selected=null;draw();break;
   case 'back':selected=null;draw();break;
   case 'read-all':savedMark(visible().slice(0,limit).map(t=>t.id));draw();break;
   case 'more':limit+=25;draw();break;
   case 'dismiss':$('paymentLive').hidden=true;break;
   case 'requests':$('messagesDialog').close();document.querySelector('.app-header [data-action="requests"]').click();break;
  }
 });
 const observer=new MutationObserver(()=>{
  const now=scope();if(now!==previousScope){previousScope=now;selected=null;filter='all';$('paymentLive').hidden=true;draw();}badge();
  // Version stamp follows the unchanged 2.1 portability/amount enhancements.
  $('screen').querySelectorAll('.foot-note').forEach(n=>{if(/2\.(?:0\.0|1\.[012])/.test(n.textContent))n.innerHTML=n.innerHTML.replace(/2\.(?:0\.0|1\.[012])/g,'2.2.0');});
 });observer.observe($('screen'),{childList:true,subtree:true});
 window.addEventListener('storage',ev=>{
  if(ev.key===D.KEY){try{accept(JSON.parse(ev.newValue),true);}catch(_){} }
  if(ev.key===READ_KEY){loadRead();draw();}
 });
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){load();loadRead();accept(current,true);}});
 document.addEventListener('click',ev=>{if(ev.target.closest('[data-action="confirmReset"]')){load();announced.clear();$('paymentLive').hidden=true;draw();}});
 $('messagesDialog').addEventListener('click',ev=>{if(ev.target===$('messagesDialog')){const r=ev.target.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)ev.target.close();}});
 badge();
})();
