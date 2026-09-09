/* WaslPay 2.0: local-only interactive prototype. Not a payment service.
   No authentication, bank calls, real QR tokens, or personal-data collection.
   Production MUST enforce every permission and posting atomically on a server. */
'use strict';
const Wasl = (() => {
 const KEY='waslpay-family-demo-v2';
 const periods={daily:'يومي',weekly:'أسبوعي',monthly:'شهري'};
 const categories={food:'طعام ومقصف',school:'تعليم وقرطاسية',transport:'مواصلات',grocery:'مقاضي البيت',health:'صحة ودواء',phone:'هاتف وإنترنت',cash:'سحب نقدي'};
 const money=n=>Number(n).toLocaleString('en-US');
 const escape=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const number=s=>Number(String(s).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[,٬\s]/g,''));
 const uid=()=>globalThis.crypto&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,11);
 const day=t=>new Date(t+10800000).toISOString().slice(0,10);
 function periodKey(p,t=Date.now()){
  const date=day(t);
  if(p==='monthly')return date.slice(0,7);
  if(p==='daily')return date;
  const d=new Date(date+'T00:00:00Z');
  d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+1)%7));
  return d.toISOString().slice(0,10);
 }
 function cycle(m,t=Date.now()){
  const k=periodKey(m.period,t);
  if(m.key!==k){m.key=k;m.spent=0;m.extra=0;}
  return m;
 }
 function nextReset(m,t=Date.now()){
  const d=new Date(day(t)+'T00:00:00Z');
  if(m.period==='daily')d.setUTCDate(d.getUTCDate()+1);
  else if(m.period==='weekly')d.setUTCDate(d.getUTCDate()+7-((d.getUTCDay()+1)%7));
  else {d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+1);}
  return d.toISOString().slice(0,10);
 }
 function valid(n,max=2000000){if(!Number.isSafeInteger(n)||n<1||n>max)throw Error('أدخل مبلغًا صحيحًا بالريال، دون كسور، بين 1 و'+money(max)+'.');return n;}
 function getMember(s,id){const m=s.members.find(m=>m.id===id);if(!m)throw Error('لم يتم العثور على الفرد.');return cycle(m);}
 function post(s,title,amount,kind,memberId=''){s.tx.unshift({id:uid(),title,amount,kind,memberId,at:Date.now()});}
 function debit(s,n){valid(n);if(n>s.wallet)throw Error('الرصيد المتاح للمحفظة لا يكفي. المخصص حد للصرف وليس رصيدًا مضمونًا.');s.wallet-=n;}
 function createState(){
  const defs=[['m1','الأم','adult','pink',30000,'monthly',30000,['food','school','transport','grocery','health','phone','cash']],['m2','الابن','child','blue',1000,'daily',1000,['food','school','transport']],['m3','الابنة','child','pink',5000,'weekly',2000,['food','school','transport']]];
  return {schema:2,wallet:125000,familyName:'عائلتي',members:defs.map(([id,name,role,color,limit,period,perPayment,allowed])=>({id,name,role,color,limit,period,perPayment,allowed,active:true,key:periodKey(period),spent:0,extra:0,giftBalance:0})),gifts:[],requests:[],goals:[{id:'g1',name:'صندوق المدرسة',target:30000,saved:0}],tx:[]};
 }
 const actions={
  pay(s,{amount,title,kind='payment'}){debit(s,valid(amount));post(s,title,-amount,kind);},
  deposit(s,{amount}){valid(amount);if(s.wallet+amount>100000000)throw Error('وصلت إلى حد الرصيد التجريبي.');s.wallet+=amount;post(s,'إيداع نقدي — تأكيد تجريبي',amount,'deposit');},
  familyPay(s,{memberId,amount,category,merchant,source='family'}){
   const m=getMember(s,memberId);valid(amount);
   if(!m.active)throw Error('الصرف موقوف مؤقتًا لهذا الفرد.');
   if(!m.allowed.includes(category))throw Error('هذا النوع من الإنفاق غير مسموح لهذا الفرد.');
   if(amount>m.perPayment)throw Error('تجاوزت حد العملية الواحدة: '+money(m.perPayment)+' ر.ي.');
   if(source==='gift'){
    if(amount>m.giftBalance)throw Error('رصيد العسب الخاص بهذا الفرد لا يكفي.');
    m.giftBalance-=amount;post(s,m.name+' · '+merchant+' (من العسب)',-amount,'giftPay',m.id);
   }else{
    if(amount>m.limit+m.extra-m.spent)throw Error('تجاوزت المتبقي من المخصص. أرسل طلب زيادة إلى صاحب المحفظة.');
    debit(s,amount);m.spent+=amount;post(s,m.name+' · '+merchant,-amount,'familyPay',m.id);
   }
  },
  member(s,{id,name,role,color,limit,period,perPayment,allowed}){
   name=String(name||'').trim();if(name.length<2||name.length>25)throw Error('اكتب اسمًا تجريبيًا من 2 إلى 25 حرفًا.');
   valid(limit,1000000);valid(perPayment,1000000);
   if(!Object.keys(periods).includes(period)||!['adult','child'].includes(role)||!['pink','blue','gold'].includes(color))throw Error('اختيار غير صالح.');
   allowed=allowed.filter(c=>Object.prototype.hasOwnProperty.call(categories,c));if(!allowed.length)throw Error('اختر نوع إنفاق واحدًا على الأقل.');
   let m=id?getMember(s,id):null;
   if(m){
    if(period!==m.period&&m.spent>0)throw Error('لا يمكن تغيير دورية المخصص بعد الصرف في الفترة الحالية؛ انتظر تجددها.');
    if(limit+m.extra<m.spent)throw Error('لا يمكن خفض الحد إلى أقل من المصروف بالفعل.');
    Object.assign(m,{name,role,color,limit,period,perPayment,allowed});cycle(m);
   }else{
    if(s.members.length>=12)throw Error('الحد في هذه المعاينة 12 فردًا.');
    s.members.push({id:uid(),name,role,color,limit,period,perPayment,allowed,active:true,key:periodKey(period),spent:0,extra:0,giftBalance:0});
   }
  },
  toggle(s,{memberId}){const m=getMember(s,memberId);m.active=!m.active;},
  request(s,{memberId,amount,reason}){
   const m=getMember(s,memberId);valid(amount,100000);reason=String(reason||'').trim();
   if(!m.active)throw Error('هذا الفرد موقوف مؤقتًا.');
   if(reason.length<2||reason.length>100)throw Error('اكتب سببًا مختصرًا للطلب.');
   if(s.requests.some(r=>r.memberId===memberId&&r.status==='pending'&&r.key===m.key&&r.period===m.period))throw Error('لديك طلب ينتظر المراجعة في هذه الفترة.');
   s.requests.unshift({id:uid(),memberId,amount,reason,status:'pending',key:m.key,period:m.period,at:Date.now()});
  },
  decide(s,{id,approve}){
   const r=s.requests.find(r=>r.id===id);if(!r||r.status!=='pending')throw Error('هذا الطلب عولج بالفعل.');
   const m=getMember(s,r.memberId);
   if(approve){
    if(r.key!==m.key||r.period!==m.period)throw Error('انتهت فترة هذا الطلب. اطلب زيادة جديدة للفترة الحالية.');
    if(!m.active)throw Error('أعد تفعيل الفرد أولًا.');
    if(m.limit+m.extra+r.amount>1000000)throw Error('تجاوز الحد التجريبي للمخصص.');
    m.extra+=r.amount;
   }
   r.status=approve?'approved':'rejected';
  },
  gift(s,{memberIds,amount,note,color}){
   valid(amount,1000000);const ids=[...new Set(memberIds)];
   if(!ids.length)throw Error('اختر مستلمًا واحدًا على الأقل.');
   if(!['auto','pink','blue','gold'].includes(color))throw Error('لون الظرف غير صالح.');
   note=String(note||'عيد مبارك، وكل عام وأنت بخير').trim().slice(0,120);
   ids.forEach(id=>getMember(s,id));const total=valid(amount*ids.length);debit(s,total);
   ids.forEach(id=>{const m=getMember(s,id);s.gifts.unshift({id:uid(),memberId:id,amount,note,color:color==='auto'?m.color:color,status:'sealed',at:Date.now()});});
   post(s,'حجز '+ids.length+' ظرف عسب تجريبي',-total,'giftHold');
  },
  openGift(s,{id}){
   const g=s.gifts.find(g=>g.id===id);if(!g||g.status!=='sealed')throw Error('هذا الظرف فُتح أو ألغي بالفعل.');
   const m=getMember(s,g.memberId);g.status='opened';m.giftBalance+=g.amount;
   post(s,'فتح ظرف '+m.name+' — من المبلغ المحجوز',0,'giftOpen',m.id);
  },
  cancelGift(s,{id}){
   const g=s.gifts.find(g=>g.id===id);if(!g||g.status!=='sealed')throw Error('لا يمكن إلغاء ظرف فُتح أو سبق إلغاؤه.');
   g.status='cancelled';s.wallet+=g.amount;post(s,'إعادة حجز ظرف لم يُفتح',g.amount,'giftReturn');
  },
  goal(s,{name,target}){
   valid(target,2000000);name=String(name||'').trim();if(name.length<2||name.length>35)throw Error('اكتب اسمًا تجريبيًا للهدف من 2 إلى 35 حرفًا.');
   if(s.goals.length>=8)throw Error('الحد التجريبي 8 أهداف.');s.goals.push({id:uid(),name,target,saved:0});
  },
  saveGoal(s,{id,amount,release=false}){
   const g=s.goals.find(g=>g.id===id);if(!g)throw Error('الهدف غير موجود.');valid(amount);
   if(release){if(amount>g.saved)throw Error('الرصيد المدخر في هذا الهدف لا يكفي.');g.saved-=amount;s.wallet+=amount;}
   else{if(amount>g.target-g.saved)throw Error('المبلغ أكبر من المتبقي للهدف.');debit(s,amount);g.saved+=amount;}
   post(s,(release?'إعادة من ':'ادخار في ')+g.name,release?amount:-amount,release?'goalReturn':'goalHold');
  }
 };
 function execute(state,name,payload){
  if(!Object.prototype.hasOwnProperty.call(actions,name))throw Error('عملية غير معروفة.');
  const next=JSON.parse(JSON.stringify(state));next.members.forEach(m=>cycle(m));actions[name](next,payload);return next;
 }
 const assets=s=>s.wallet+s.goals.reduce((a,g)=>a+g.saved,0)+s.gifts.filter(g=>g.status==='sealed').reduce((a,g)=>a+g.amount,0)+s.members.reduce((a,m)=>a+m.giftBalance,0);
 return {KEY,periods,categories,money,escape,number,uid,day,periodKey,cycle,nextReset,valid,createState,execute,assets};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Wasl;
if(typeof document!=='undefined')(() => {
 const D=Wasl,$=id=>document.getElementById(id),e=D.escape,f=D.money;
 let state,storageAvailable=true,view='home',memberView=null,hideBalance=false,toastTimer;
 try{const raw=localStorage.getItem(D.KEY);state=raw?JSON.parse(raw):D.createState();if(state.schema!==2||!Array.isArray(state.members)||!Number.isFinite(state.wallet))state=D.createState();}catch(_){state=D.createState();storageAvailable=false;}
 const paths={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 family:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a5 5 0 0 1 9-3M15 4a3 3 0 0 1 0 6"/><circle cx="17" cy="14" r="2"/><path d="M13 21v-1a4 4 0 0 1 8 0v1"/>',
 gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/>',
 qr:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h3v3h3v3h-6v-3M21 15v1"/>',
 more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
 bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 send:'<path d="M5 19 19 5M6 5h13v13"/>',
 down:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
 eye:'<path d="M2 12c4-8 16-8 20 0-4 8-16 8-20 0Z"/><circle cx="12" cy="12" r="3"/>',
 phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4M10 5h4"/>',
 wifi:'<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M9 16a5 5 0 0 1 6 0M12 20h.01"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
 book:'<path d="M3 3h7l2 2 2-2h7v17h-7l-2 2-2-2H3zM12 5v17"/>',
 history:'<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6M12 7v5l3 2"/>',
 goal:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 shield:'<path d="m12 2 8 4v7c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
 user:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
 shop:'<path d="m3 9 2-6h14l2 6v3H3V9ZM5 12v9h14v-9M9 21v-5h6v5"/>',
 refresh:'<path d="M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6M4 17a9 9 0 0 0 15 2l3-3m0 6v-6h-6"/>'
 };
 const icon=k=>'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+(paths[k]||paths.gift)+'</svg>';
 const avatar=m=>'<div class="member-avatar '+e(m.color)+'">'+(m.role==='adult'?(m.color==='pink'?'👩':'🧑'):(m.color==='pink'?'👧':'👦'))+'</div>';
 const remaining=m=>Math.max(0,m.limit+m.extra-m.spent);
 const amt=n=>'<span dir="ltr">'+f(n)+'</span> <small>ر.ي</small>';
 const button=(action,text,cls='primary',attrs='')=>'<button type="button" class="'+cls+'" data-action="'+action+'" '+attrs+'>'+text+'</button>';
 const heading=(title,sub,ico)=>'<div class="page-title"><div><h2>'+title+'</h2><p class="muted">'+sub+'</p></div><span class="title-icon">'+icon(ico)+'</span></div>';
 const field=(id,label,placeholder='',value='',type='text')=>'<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" name="'+id+'" type="'+type+'" '+(type==='text'?'maxlength="120"':'')+' '+(/amount|limit|payment|target/i.test(id)?'inputmode="decimal"':'')+' placeholder="'+e(placeholder)+'" value="'+e(value)+'" autocomplete="off"></div>';
 const select=(id,label,values,selected)=>'<div class="field"><label for="'+id+'">'+label+'</label><select id="'+id+'">'+Object.entries(values).map(([k,v])=>'<option value="'+e(k)+'" '+(k===selected?'selected':'')+'>'+e(v)+'</option>').join('')+'</select></div>';
 const formFooter=text=>'<p id="formError" class="form-error" role="alert"></p><button class="primary" type="submit">'+text+'</button>';
 const hint=(text,kind='')=>'<div class="hint '+kind+'">'+text+'</div>';
 const envelope=(color='pink',opened=false)=>'<div class="envelope '+e(color)+(opened?' opened':'')+'"><span class="seal">و</span></div>';
 function persist(){try{localStorage.setItem(D.KEY,JSON.stringify(state));}catch(_){storageAvailable=false;}}
 function commit(action,data){state=D.execute(state,action,data);persist();render(false);}
 function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3600);}
 function error(err){if($('formError'))$('formError').textContent=err.message||String(err);else toast(err.message||String(err));}
 function close(){if($('dialog').open)$('dialog').close();}
 function modal(title,body){$('dialogTitle').textContent=title;$('dialogBody').innerHTML=body;if(!$('dialog').open)$('dialog').showModal();$('dialog').scrollTop=0;}
 function success(title,text,amount){modal('إيصال تجريبي', '<div class="receipt"><div class="success-icon">'+icon('check')+'</div><h3>'+e(title)+'</h3>'+(amount!==undefined?'<div class="receipt-amount">'+amt(amount)+'</div>':'')+'<p>'+e(text)+'</p><p class="reference">DEMO · '+e(D.uid().slice(0,12))+'</p>'+hint('محاكاة محلية فقط. لم يُرسل مال أو إشعار لأي شخص.','warn')+button('close','حسنًا')+'</div>');}
 function go(name){close();view=name;memberView=name==='member'?memberView:null;try{history.replaceState(null,'','#'+name);}catch(_){}render(true);}
 function preview(id){memberView=id;go('member');}
 function transactions(list){return list.length?list.map(t=>'<div class="tx"><span class="tx-icon">'+icon(t.kind.startsWith('gift')?'gift':t.kind.startsWith('goal')?'goal':t.kind==='familyPay'?'family':t.amount>0?'down':'send')+'</span><div class="tx-info"><strong>'+e(t.title)+'</strong><small>'+e(D.day(t.at))+' · عملية تجريبية</small></div><b class="tx-sum '+(t.amount<0?'minus':'plus')+'" dir="ltr">'+(t.amount<0?'− ':t.amount>0?'+ ':'')+f(Math.abs(t.amount))+'</b></div>').join(''):'<div class="empty">لا عمليات بعد. جرّب الإيداع أو الدفع من مخصص أحد أفراد الأسرة.</div>';}
 function balanceCard(){const held=state.gifts.filter(g=>g.status==='sealed').reduce((a,g)=>a+g.amount,0),saved=state.goals.reduce((a,g)=>a+g.saved,0);return '<div class="balance"><div class="row"><span class="label">رصيدك المتاح · تجريبي</span>'+button('balance',icon('eye'),'eye','aria-label="إخفاء أو إظهار الرصيد"')+'</div><div class="money"><small>ريال يمني</small><strong>'+ (hideBalance?'••••••':f(state.wallet))+'</strong></div><div class="label">المخصصات حدود للصرف من هذا الرصيد</div><div class="row balance-foot"><div>محجوز للعسب<b>'+(hideBalance?'•••':f(held))+' ر.ي</b></div><div>مدخر للأهداف<b>'+(hideBalance?'•••':f(saved))+' ر.ي</b></div><span>أموال وهمية</span></div></div>';}
 function home(){return '<div class="greeting row"><div><h2>أهلًا بك في وَصْل</h2><span class="muted">كل ما يهم عائلتك، في مكان واحد.</span></div><div class="avatar">☀</div></div>'+balanceCard()+'<div class="quick">'+[['deposit','plus','إيداع'],['send','send','إرسال'],['withdraw','down','سحب'],['pay','qr','دفع']].map(([a,i,t])=>button(a,'<span>'+icon(i)+'</span>'+t,'')).join('')+'</div><div class="heading"><h3>أقرب للناس الذين تحبهم</h3><span class="notice-tag">جديد</span></div><div class="tiles">'+button('family','<span class="tiny-pill">'+state.members.length+' أفراد</span>'+icon('family')+'<strong>العائلة</strong><small>رصيد واحد.<br>مصروف لكل فرد.</small>','feature-card')+button('gifts','<span class="tiny-pill">فرحة بطريقتنا</span>'+icon('gift')+'<strong>العسب والعيدية</strong><small>ظرف صغير.<br>فرحة كبيرة.</small>','feature-card pink')+'</div><div class="heading"><h3>الخدمات اليومية</h3>'+button('services','عرض الكل','text-button')+'</div><div class="services-grid">'+[['phone','شحن الهاتف'],['wifi','الإنترنت'],['bolt','الكهرباء']].map(([i,t])=>button('service',icon(i)+t,'service-button','data-name="'+t+'"')).join('')+'</div><div class="heading"><h3>صندوق هدف الأسرة</h3>'+button('goals','إدارة الأهداف','text-button')+'</div>'+goalCard(state.goals[0],true)+'<div class="heading"><h3>آخر العمليات</h3>'+button('activity','عرض الكل','text-button')+'</div><div class="card">'+transactions(state.tx.slice(0,3))+'</div>';}
 function memberCard(m){return '<article class="member-card '+(!m.active?'paused':'')+'"><div class="row"><div class="member-info">'+avatar(m)+'<div><div class="member-name">'+e(m.name)+'</div><small class="micro">'+(m.role==='child'?'ملف طفل بإشراف ولي الأمر':'فرد بالغ · مشاركة بموافقته')+'</small></div></div><span class="badge '+(!m.active?'paused':'')+'">'+(m.active?D.periods[m.period]:'موقوف')+'</span></div><div class="member-budget"><b>'+amt(remaining(m))+'</b><span>المتبقي من '+f(m.limit+m.extra)+'</span></div><div class="progress"><i class="'+(remaining(m)<(m.limit+m.extra)*.2?'over':'')+'" style="width:'+Math.min(100,100*m.spent/(m.limit+m.extra))+'%"></i></div><div class="row micro"><span>صُرف '+f(m.spent)+' ر.ي</span><span>يتجدد '+D.nextReset(m)+'</span></div><div class="category-list">'+m.allowed.map(c=>'<span>'+D.categories[c]+'</span>').join('')+'</div><div class="button-row">'+button('preview','معاينة حسابه','primary','data-id="'+m.id+'"')+button('editMember','تعديل الحد','secondary','data-id="'+m.id+'"')+button('toggleMember',m.active?'إيقاف':'تفعيل','secondary','data-id="'+m.id+'"')+'</div></article>';}
 function family(){const spent=state.tx.filter(t=>t.kind==='familyPay'&&D.day(t.at).slice(0,7)===D.day(Date.now()).slice(0,7)).reduce((a,t)=>a-t.amount,0);return heading('العائلة',''+e(state.familyName)+' · أنت تدير المحفظة','family')+hint('لكل فرد مخصص مستقل؛ لا يُخصم شيء عند تخصيصه. الخصم من رصيدك عند الدفع فقط. لا يُرحّل غير المصروف إلى الفترة التالية.')+'<div class="summary-grid"><div class="stat"><small>الرصيد المشترك المتاح</small><b>'+amt(state.wallet)+'</b></div><div class="stat"><small>صرف الأسرة هذا الشهر</small><b>'+amt(spent)+'</b></div></div><div class="heading"><h3>أفراد الأسرة</h3>'+button('addMember','+ إضافة فرد','text-button')+'</div>'+state.members.map(memberCard).join('')+button('requests',icon('bell')+' طلبات زيادة المصروف','secondary')+hint('الدوريّة بتوقيت اليمن: يومي عند منتصف الليل، أسبوعي يوم السبت، وشهري في أول الشهر الميلادي. تتحدث العدادات عند فتح أو استخدام المعاينة.')+'<div class="foot-note">الحسابات على أجهزة مختلفة والتحقق من هويات البالغين وإشراف القاصرين غير مفعلة هنا. لا حاجة لإدخال بيانات حقيقية.</div>';}
 function memberPage(){const m=state.members.find(m=>m.id===memberView);if(!m)return family();return '<div class="preview-banner">معاينة واجهة '+e(m.name)+' على هذا الجهاز فقط؛ ليست جلسة دخول مستقلة.'+button('family','العودة إلى إدارة العائلة','')+'</div><div class="member-view-hero">'+avatar(m)+'<h3>أهلًا، '+e(m.name)+'</h3><div class="muted">المتبقي من مصروفك '+D.periods[m.period]+'</div><div class="big">'+amt(remaining(m))+'</div><span class="badge '+(!m.active?'paused':'')+'">'+(m.active?'يتجدد '+D.nextReset(m):'الصرف موقوف مؤقتًا')+'</span><p class="micro">هذا حد صرف وليس رصيدًا محجوزًا.<br>الدفع مشروط بتوافر رصيد في المحفظة المشتركة.</p></div><div class="button-row">'+button('memberPay',icon('qr')+' ادفع من مصروفي','primary','data-id="'+m.id+'"')+button('askExtra','أطلب زيادة','secondary','data-id="'+m.id+'"')+'</div>'+hint('حد العملية الواحدة: '+f(m.perPayment)+' ر.ي. أنواع الإنفاق المسموحة: '+m.allowed.map(c=>D.categories[c]).join('، '))+ '<div class="card"><div class="row"><div><b>عسبي الخاص</b><div class="muted">لا يدخل في حد المصروف الدوري</div></div><b>'+amt(m.giftBalance)+'</b></div>'+button('memberGiftPay','الدفع من العسب','secondary','data-id="'+m.id+'"')+'</div><div class="heading"><h3>ظروفي</h3></div>'+giftsList(state.gifts.filter(g=>g.memberId===m.id),true)+'<div class="heading"><h3>طلباتي</h3></div>'+requestsList(state.requests.filter(r=>r.memberId===m.id),true)+'<div class="heading"><h3>عملياتي</h3></div><div class="card">'+transactions(state.tx.filter(t=>t.memberId===m.id).slice(0,10))+'</div>';}
 function requestsList(list,readOnly=false){return list.length?list.map(r=>{const m=state.members.find(m=>m.id===r.memberId),expired=r.key!==m.key||r.period!==m.period;return '<article class="request-card"><div class="row"><h3>'+e(m.name)+' · '+amt(r.amount)+'</h3><span class="badge">'+(r.status==='approved'?'معتمد':r.status==='rejected'?'مرفوض':expired?'انتهت الفترة':'بانتظارك')+'</span></div><p>'+e(r.reason)+'</p><small class="micro">زيادة للفترة الحالية فقط. لا تُخصم أموال عند الموافقة.</small>'+(!readOnly&&r.status==='pending'?'<div class="button-row">'+(!expired?button('approve','الموافقة على الزيادة','primary','data-id="'+r.id+'"'):'')+button('reject',expired?'إغلاق الطلب':'رفض','secondary','data-id="'+r.id+'"')+'</div>':'')+'</article>';}).join(''):'<div class="empty">لا طلبات بعد. من «معاينة حسابه» يستطيع الفرد طلب زيادة مع ذكر السبب.</div>';}
 function requests(){return heading('طلبات الأسرة','زيادة لمرة واحدة وبقرار منك','bell')+hint('الموافقة ترفع السقف لهذه الفترة فقط، ولا تنشئ رصيدًا. حدود نوع الإنفاق والعملية الواحدة تبقى كما هي.')+requestsList(state.requests);}
 function giftsList(list,member=false){return list.length?list.map(g=>{const m=state.members.find(m=>m.id===g.memberId);return '<article class="gift-mini">'+envelope(g.color,g.status==='opened')+'<div><h3>عسب إلى '+e(m.name)+'</h3><p>'+(g.status==='sealed'&&member?'مفاجأة بانتظارك':f(g.amount)+' ر.ي')+' · '+(g.status==='sealed'?'بانتظار الفتح':g.status==='opened'?'فُتح تجريبيًا':'ألغي وأعيد الحجز')+'</p></div>'+(g.status==='sealed'?'<div class="button-row">'+button('openGift',member?'افتح ظرفي':'محاكاة فتح المستلم','primary','data-id="'+g.id+'"')+(!member?button('cancelGift','إلغاء واسترداد','secondary','data-id="'+g.id+'"'):'')+'</div>':'')+'</article>';}).join(''):'<div class="empty">أول ظرف، وأول فرحة.<br>أنشئ عسبًا تجريبيًا لأحد أفراد الأسرة.</div>';}
 function gifts(){return heading('العسب والعيدية','محبة تُهدى، وفرحة تُفتح','gift')+'<div class="gift-hero"><span class="spark one">✧</span><span class="spark two">✦</span>'+envelope('pink')+'<h3>عيدكم محبة وفرح</h3><p>وردي للنساء والبنات، وأزرق للأولاد،<br>واللون دائمًا اختيارك. أرسل محبتك بطريقتك.</p></div>'+button('newGift',icon('gift')+' تجهيز عسب جديد')+hint('تُحجز قيمة الظروف من المتاح مرة واحدة. الفتح ينقل الحجز إلى رصيد هدايا المستلم التجريبي؛ والإلغاء متاح قبل الفتح فقط.','pink')+'<div class="heading"><h3>ظروف العائلة</h3><span class="micro">'+state.gifts.length+' ظرف</span></div>'+giftsList(state.gifts)+'<div class="foot-note">الظروف تجارب على هذا الجهاز؛ لا تُرسل إلى هواتف الآخرين. فتح الظرف لا ينفذ تحويلًا مصرفيًا.</div>';}
 function goalCard(g,brief=false){if(!g)return '';return '<article class="card"><div class="row"><div class="member-info"><span class="goal-icon">'+icon('goal')+'</span><div><strong>'+e(g.name)+'</strong><div class="muted">'+f(g.saved)+' من '+f(g.target)+' ر.ي</div></div></div><span class="badge">'+Math.round(g.saved/g.target*100)+'%</span></div><div class="progress"><i style="width:'+Math.min(100,g.saved/g.target*100)+'%"></i></div>'+(!brief?'<div class="button-row">'+button('saveGoal','أضف للهدف','primary','data-id="'+g.id+'"')+button('releaseGoal','أعد إلى المتاح','secondary','data-id="'+g.id+'"')+'</div>':'')+'</article>';}
 function goals(){return heading('صندوق هدف الأسرة','للمدرسة، للعلاج، أو لفرحة قادمة','goal')+hint('المدخر يُفصل عن الرصيد المتاح فلا تصرفه المخصصات. لا فوائد ولا استثمارات؛ مجرد فصل تجريبي للأموال.')+state.goals.map(g=>goalCard(g)).join('')+button('newGoal','+ هدف جديد','secondary');}
 function more(){return heading('المزيد','خدماتك وخصوصيتك في مكان واحد','more')+'<div class="menu">'+[['activity','history','سجل العمليات','الدفع والمخصصات وحجوزات العسب'],['services','phone','الخدمات اليومية','شحن، إنترنت، كهرباء وتعليم'],['goals','goal','صندوق هدف الأسرة','افصل مبلغًا لهدفك عن المتاح للصرف'],['profile','shield','الحساب والخصوصية','ما الذي تفعله المعاينة وما الذي لا تفعله'],['reset','refresh','إعادة التجربة من البداية','حذف البيانات المحلية وإعادة الرصيد الوهمي']].map(([a,i,t,d])=>button(a,icon(i)+'<div><b>'+t+'</b><small>'+d+'</small></div><span>‹</span>','')).join('')+'</div><p class="foot-note">وَصْل Pay · 2.0.0<br>تحديث الخميس 10 سبتمبر 2026</p>';}
 function services(){return heading('الخدمات','جميع الأسماء والأسعار في التجربة تمثيلية','phone')+'<div class="services-grid">'+[['phone','شحن الهاتف'],['wifi','الإنترنت'],['bolt','الكهرباء'],['book','التعليم'],['shop','مشتريات تاجر'],['qr','الدفع']].map(([i,t])=>button('service',icon(i)+t,'service-button','data-name="'+t+'"')).join('')+ '</div>'+hint('لا توجد أي اتفاقية ربط مفعلة مع بنك أو شركة اتصالات أو تاجر. أزرار هذه الصفحة للمحاكاة فقط.','warn');}
 function profile(){return heading('الحساب والخصوصية','معاينة بلا تسجيل ولا حساب بنكي حقيقي','shield')+'<div class="card"><h3>بيانات تجريبية فقط</h3><p class="muted">تُحفظ إعدادات العائلة والمبالغ في هذا المتصفح. لا تُرسل إلى بنك أو خادم، ولا تتزامن مع هاتف آخر. لا تُدخل هوية أو رقمًا سريًا أو بيانات مصرفية.</p></div><div class="card"><h3>لا مشاركة لكلمة السر</h3><p class="muted">في المنتج التشغيلي نحتاج ملفًا وصلاحيات مستقلة لكل مستخدم، وموافقة البالغين المشاركين، ومسار إشراف للقاصرين يوافق عليه البنك المرخّص. عدم وجود حساب بنكي مستقل لا يعني غياب التحقق من الهوية.</p></div>'+hint('تبديل واجهات الأسرة هنا ليس تسجيل دخول أو قفلًا أمنيًا. يمكن تعديل بيانات المتصفح؛ لذلك لا يجوز استخدام هذا النموذج لإدارة أموال فعلية.','danger')+hint('الألوان قابلة للاختيار. تفاصيل مشتريات البالغين وإتاحة تقاريرهم يجب ضبطها بالموافقة. لا يحصل أي فرد في المعاينة على وصول لجهات اتصال أو كاميرا أو موقع.')+'<div class="foot-note">لا توجد رسوم أو تراخيص أو شارات توثيق حقيقية في هذه المعاينة.</div>';}
 function render(scroll=false){state.members.forEach(m=>D.cycle(m));persist();const screens={home,family,member:memberPage,gifts,requests,goals,more,services,profile,activity:()=>heading('سجل العمليات','الوارد والصادر والحجوزات · بيانات تجريبية','history')+'<div class="card">'+transactions(state.tx)+'</div>'+hint('فتح العسب لا يخصم مرة ثانية. حجوزات الأهداف والعسب ليست مشتريات ولا إيرادات.')};if(!screens[view])view='home';$('screen').innerHTML=screens[view]()+(!storageAvailable?hint('التخزين المحلي غير متاح. قد تختفي التغييرات عند إغلاق الصفحة.','warn'):'');if(scroll)$('screen').scrollTop=0;$('nav').innerHTML=[['home','home','الرئيسية'],['family','family','العائلة'],['pay','qr','ادفع'],['gifts','gift','العسب'],['more','more','المزيد']].map(([a,i,t])=>button(a,icon(i)+'<span>'+t+'</span>','nav-button '+(a==='pay'?'pay':'')+' '+((a===view||(view==='member'&&a==='family'))?'active':''),'aria-label="'+t+'"')).join('');$('bellIcon').innerHTML=icon('bell');const n=state.requests.filter(r=>r.status==='pending').length;$('requestCount').hidden=!n;$('requestCount').textContent=n;}
 function memberForm(id){const m=id?state.members.find(m=>m.id===id):{name:'',role:'child',color:'blue',limit:1000,period:'daily',perPayment:1000,allowed:['food','school','transport']};modal(id?'تعديل مخصص الفرد':'إضافة فرد للعائلة','<form data-form="member" data-id="'+(id||'')+'">'+hint('ملف تجريبي محلي، دون تسجيل حساب أو إرسال دعوة. استخدم اسمًا مستعارًا.')+field('memberName','الاسم التجريبي','مثال: الابن',m.name)+ '<div class="small-grid">'+select('memberRole','صفة الفرد',{adult:'فرد بالغ',child:'طفل بإشراف ولي الأمر'},m.role)+select('memberColor','لون البطاقة والظرف',{pink:'وردي',blue:'أزرق',gold:'ذهبي'},m.color)+'</div><div class="small-grid">'+field('memberLimit','المخصص بالريال','1000',m.limit)+select('memberPeriod','يتجدد',D.periods,m.period)+'</div>'+field('perPayment','أقصى مبلغ للعملية الواحدة','1000',m.perPayment)+'<fieldset class="field"><legend>الإنفاق المسموح · تصنيفات تمثيلية</legend><div class="check-grid">'+Object.entries(D.categories).map(([k,v])=>'<label class="checkbox-row"><input type="checkbox" name="category" value="'+k+'" '+(m.allowed.includes(k)?'checked':'')+'>'+v+'</label>').join('')+'</div></fieldset>'+hint('الأسبوع يبدأ السبت. لا ترحيل للفائض. لا يمكن تغيير الدورية بعد بدء الصرف في الفترة الحالية؛ تعديلها لا يجوز أن يمحو المصروف.')+formFooter('حفظ المخصص')+'</form>');}
 function payMemberForm(id,source='family'){const m=state.members.find(m=>m.id===id);modal(source==='gift'?'الدفع من العسب الخاص':'الدفع من مصروف '+m.name,'<form data-form="memberPay" data-id="'+id+'" data-source="'+source+'">'+hint('المتاح '+f(source==='gift'?m.giftBalance:remaining(m))+' ر.ي. حد العملية '+f(m.perPayment)+' ر.ي.')+field('payMerchant','التاجر التجريبي','مثال: مقصف المدرسة','مقصف المدرسة')+select('payCategory','نوع التاجر · محاكاة',D.categories,'food')+field('payAmount','المبلغ بالريال','500')+hint('في التشغيل الحقيقي يُتحقق من تصنيف التاجر على الخادم؛ الاختيار هنا لا يمثل نظام حماية ماليًا.','warn')+formFooter('محاكاة الدفع')+'</form>');}
 function askExtra(id){modal('طلب زيادة لمرة واحدة','<form data-form="request" data-id="'+id+'">'+field('extraAmount','مبلغ الزيادة','500')+field('extraReason','لماذا تحتاج زيادة؟','مثال: شراء كراسة مدرسية')+hint('يصل الطلب إلى شاشة صاحب المحفظة في هذه المعاينة فقط. الزيادة تخص الفترة الحالية ولا تتكرر.')+formFooter('إرسال الطلب التجريبي')+'</form>');}
 function giftForm(){modal('تجهيز العسب','<form data-form="gift"><fieldset class="field"><legend>لمن العسب؟ يمكنك اختيار أكثر من فرد</legend>'+state.members.map(m=>'<label class="checkbox-row recipient-row"><input type="checkbox" name="recipient" value="'+m.id+'">'+avatar(m)+'<span>'+e(m.name)+'</span></label>').join('')+'</fieldset>'+field('giftAmount','قيمة كل ظرف بالريال','2000')+select('giftColor','لون الظروف',{auto:'حسب لون بطاقة كل مستلم',pink:'وردي للجميع',blue:'أزرق للجميع',gold:'ذهبي للجميع'},'auto')+'<div class="field"><label for="giftNote">كلمة من القلب</label><textarea id="giftNote" maxlength="120">عيد مبارك، وكل عام وأنت بخير ومحبة 🌙</textarea></div><div id="giftTotal" class="hint pink">اختر المستلمين وحدد قيمة كل ظرف.</div>'+hint('هذه الظروف لن تُرسل لأحد. يُحجز إجمالي قيمتها من الرصيد التجريبي بعد التأكيد فقط.','warn')+formFooter('إنشاء الظروف وحجز قيمتها')+'</form>');}
 function openGiftModal(id){const g=state.gifts.find(g=>g.id===id);if(!g)return;const m=state.members.find(m=>m.id===g.memberId);modal('ظرف إلى '+m.name,'<div class="receipt">'+envelope(g.color)+'<h3>لك فرحة في هذا الظرف</h3><p>فتح باسم '+e(m.name)+' داخل المعاينة.</p>'+hint('هذه محاكاة استلام على نفس الجهاز. لا يوجد رابط مالي أو تحويل بنكي.','pink')+button('confirmOpenGift','افتح العسب ✨','primary','data-id="'+id+'"')+'</div>');}
 function openedGift(id){const g=state.gifts.find(g=>g.id===id),m=state.members.find(m=>m.id===g.memberId);modal('عيدك فرحة، '+m.name,'<div class="receipt">'+envelope(g.color,true)+'<h3>'+e(g.note)+'</h3><div class="receipt-amount">'+amt(g.amount)+'</div><p>أضيف إلى رصيد عسب '+e(m.name)+' التجريبي. لم يُخصم مرة ثانية من صاحب المحفظة.</p>'+hint('رصيد هدايا محلي، وليس أموالًا حقيقية. بعد الفتح لا يسترده المرسل من زر الإلغاء.','pink')+button('close','شكرًا، عيد مبارك')+'</div>');}
 function goalForm(id,release=false){const g=state.goals.find(g=>g.id===id);modal(release?'إعادة من المدخر':'أضف لهدف '+g.name,'<form data-form="saveGoal" data-id="'+id+'" data-release="'+release+'">'+hint('المدخر '+f(g.saved)+' ر.ي · المستهدف '+f(g.target)+' ر.ي.')+field('goalAmount','المبلغ بالريال','1000')+formFooter(release?'إعادة إلى الرصيد المتاح':'تخصيص للهدف')+'</form>');}
 function ownerForm(kind,name){if(memberView){payMemberForm(memberView);return;}const labels={deposit:'إيداع نقدي',send:'إرسال الأموال',withdraw:'سحب نقدي',pay:'الدفع للتاجر',service:name||'خدمة يومية'};modal(labels[kind],'<form data-form="owner" data-kind="'+kind+'" data-name="'+e(name||'')+'">'+hint('الرصيد المتاح '+f(state.wallet)+' ر.ي — تجريبي فقط.')+(kind==='send'?field('otherName','اسم مستلم تجريبي','اسم مستعار'):kind==='pay'?field('otherName','اسم التاجر التجريبي','بقالة الحي','بقالة الحي'):kind==='deposit'?select('depositPlace','نقطة إيداع تمثيلية',{bank:'فرع بنك شريك — غير مربوط',agent:'وكيل تجريبي — غير مربوط'},'bank'):'')+field('ownerAmount','المبلغ بالريال','5000')+(kind==='withdraw'?hint('رسم ثابت 100 ر.ي للمحاكاة فقط، يُضاف إلى الخصم.','warn'):'')+hint(kind==='deposit'?'إنشاء الطلب لا يضيف رصيدًا. ستحتاج إلى تأكيد الإيداع التجريبي.':'لن تُرسل أموال حقيقية أو إشعارات. لا حاجة لإدخال رقم هاتف أو حساب حقيقي.','warn')+formFooter('مراجعة العملية')+'</form>');}
 function confirmOwner(kind,amount,title){const total=amount+(kind==='withdraw'?100:0);D.valid(amount);if(kind!=='deposit'&&total>state.wallet)throw Error('الرصيد غير كافٍ لتغطية المبلغ والرسم.');modal('تأكيد عملية تجريبية','<div class="receipt"><h3>'+e(title)+'</h3><div class="receipt-amount">'+amt(total)+'</div>'+hint(kind==='deposit'?'هذا الزر يحاكي تأكيد وصول النقد من البنك، دون أي اتصال مصرفي.':'هذا هو إجمالي ما سيخصم من الرصيد الوهمي.')+'<p id="formError" class="form-error" role="alert"></p>'+button('confirmOwner',kind==='deposit'?'محاكاة تأكيد الإيداع':'تأكيد المحاكاة','primary','data-kind="'+kind+'" data-amount="'+total+'" data-title="'+e(title)+'"')+'</div>');}
 document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,id=b.dataset.id;
  try{
   if(['home','family','gifts','requests','activity','services','goals','profile','more'].includes(a)){go(a);return;}
   if(a==='close'){close();return;}
   if(a==='balance'){hideBalance=!hideBalance;render(false);return;}
   if(a==='preview'){preview(id);return;}
   if(a==='addMember'||a==='editMember'){memberForm(id);return;}
   if(a==='toggleMember'){commit('toggle',{memberId:id});toast('تم تحديث حالة الفرد داخل المعاينة.');return;}
   if(a==='memberPay'||a==='memberGiftPay'){payMemberForm(id,a==='memberGiftPay'?'gift':'family');return;}
   if(a==='askExtra'){askExtra(id);return;}
   if(a==='approve'||a==='reject'){commit('decide',{id,approve:a==='approve'});toast(a==='approve'?'اعتُمدت الزيادة لهذه الفترة فقط؛ لم يُخصم أي رصيد.':'أُغلق الطلب.');return;}
   if(a==='newGift'){giftForm();return;}
   if(a==='openGift'){openGiftModal(id);return;}
   if(a==='confirmOpenGift'){commit('openGift',{id});openedGift(id);return;}
   if(a==='cancelGift'){modal('إلغاء الظرف؟',hint('ستعاد قيمة الظرف الذي لم يُفتح إلى الرصيد المتاح. لا يمكن إلغاء ظرف بعد فتحه.')+button('confirmCancelGift','إلغاء الظرف واستعادة الحجز','danger-button','data-id="'+id+'"'));return;}
   if(a==='confirmCancelGift'){commit('cancelGift',{id});close();toast('أعيدت قيمة الحجز مرة واحدة.');return;}
   if(a==='newGoal'){modal('هدف جديد','<form data-form="goal">'+field('goalName','اسم الهدف','مثال: أدوات المدرسة')+field('goalTarget','المبلغ المستهدف بالريال','30000')+formFooter('إنشاء الهدف')+'</form>');return;}
   if(a==='saveGoal'||a==='releaseGoal'){goalForm(id,a==='releaseGoal');return;}
   if(['deposit','send','withdraw','pay','service'].includes(a)){ownerForm(a,b.dataset.name);return;}
   if(a==='confirmOwner'){const n=Number(b.dataset.amount);b.disabled=true;try{commit(b.dataset.kind==='deposit'?'deposit':'pay',{amount:n,title:b.dataset.title,kind:b.dataset.kind});success('تمت المحاكاة','سُجلت العملية في هذا المتصفح فقط.',n);}catch(err){b.disabled=false;throw err;}return;}
   if(a==='reset'){modal('إعادة المعاينة من البداية؟',hint('سيُحذف أفراد الأسرة والظروف والطلبات والعمليات التي أضفتها محليًا في هذا المتصفح فقط.','warn')+button('confirmReset','حذف بيانات التجربة وإعادة البدء','danger-button'));return;}
   if(a==='confirmReset'){state=D.createState();persist();go('home');toast('أعيد الرصيد التجريبي إلى 125,000 ر.ي.');return;}
  }catch(err){error(err);}
 });
 document.addEventListener('submit',ev=>{
  const form=ev.target;if(!form.dataset.form)return;ev.preventDefault();
  const val=id=>$(id).value.trim(),num=id=>D.number(val(id));
  try{
   switch(form.dataset.form){
    case 'member':commit('member',{id:form.dataset.id||null,name:val('memberName'),role:val('memberRole'),color:val('memberColor'),limit:num('memberLimit'),period:val('memberPeriod'),perPayment:num('perPayment'),allowed:[...form.querySelectorAll('input[name="category"]:checked')].map(x=>x.value)});close();toast('حُفظ المخصص. رصيد صاحب المحفظة لم يتغير.');break;
    case 'memberPay':{const n=num('payAmount'),merchant=val('payMerchant');if(merchant.length<2||merchant.length>60)throw Error('اكتب اسم تاجر تجريبي من 2 إلى 60 حرفًا.');commit('familyPay',{memberId:form.dataset.id,amount:n,category:val('payCategory'),merchant,source:form.dataset.source});success('تم الدفع التجريبي',form.dataset.source==='gift'?'خُصم من رصيد العسب الخاص، لا من المخصص.':'خُصم من الرصيد المشترك ومن حد هذا الفرد فقط.',n);break;}
    case 'request':commit('request',{memberId:form.dataset.id,amount:num('extraAmount'),reason:val('extraReason')});close();toast('الطلب ظاهر الآن في «طلبات الأسرة» لصاحب المحفظة.');break;
    case 'gift':{const ids=[...form.querySelectorAll('input[name="recipient"]:checked')].map(x=>x.value),n=num('giftAmount');commit('gift',{memberIds:ids,amount:n,note:val('giftNote'),color:val('giftColor')});success('ظروف العسب جاهزة','حُجز مبلغ '+ids.length+' ظرف. افتحها تجريبيًا من صفحة العسب.',n*ids.length);break;}
    case 'goal':commit('goal',{name:val('goalName'),target:num('goalTarget')});close();toast('أضيف هدف جديد دون خصم أي أموال.');break;
    case 'saveGoal':commit('saveGoal',{id:form.dataset.id,amount:num('goalAmount'),release:form.dataset.release==='true'});close();toast('تم تحديث الهدف والرصيد المتاح.');break;
    case 'owner':{const kind=form.dataset.kind,title=kind==='send'?'إرسال إلى '+val('otherName'):kind==='pay'?'دفع إلى '+val('otherName'):kind==='deposit'?'إيداع نقدي':kind==='withdraw'?'سحب نقدي يشمل رسم 100 ر.ي':form.dataset.name;if($('otherName')&&val('otherName').length<2)throw Error('اكتب اسمًا تجريبيًا واضحًا.');confirmOwner(kind,num('ownerAmount'),title);break;}
   }
  }catch(err){error(err);}
 });
 document.addEventListener('input',ev=>{if(!$('giftTotal'))return;const ids=document.querySelectorAll('input[name="recipient"]:checked').length,n=D.number($('giftAmount').value);$('giftTotal').textContent=ids&&Number.isFinite(n)&&n>0?ids+' ظرف × '+f(n)+' ر.ي = إجمالي حجز '+f(ids*n)+' ر.ي':'اختر المستلمين وحدد قيمة كل ظرف.';});
 $('dialog').addEventListener('click',ev=>{if(ev.target===$('dialog')){const r=$('dialog').getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)close();}});
 window.addEventListener('storage',ev=>{if(ev.key!==D.KEY)return;try{const next=JSON.parse(ev.newValue);if(next&&next.schema===2){state=next;render(false);}}catch(_){} });
 window.addEventListener('hashchange',()=>{const route=location.hash.slice(1);if(['home','family','gifts','requests','goals','more','services','profile','activity'].includes(route)){view=route;memberView=null;render(true);}});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)render(false);});
 view=['home','family','gifts','goals','requests','more','services','profile','activity'].includes(location.hash.slice(1))?location.hash.slice(1):'home';render();
})();
