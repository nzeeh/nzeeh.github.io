/* Local prototype UI. Storage events synchronise the existing in-page demo only.
   This is not authentication, a public investment offer, or remote delivery. */
'use strict';
(()=>{
 const D=Wasl,C=WaslCommunity230,$=id=>document.getElementById(id),e=D.escape;
 let pending=null,hideAd=false;
 const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+({gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/>',rafd:'<path d="M3 12h5l4 3 5-7h4M3 17h7l5 3 6-7M3 11v7M21 7v7"/>',home:'<path d="m3 10 9-7 9 7v11H3zM9 21v-8h6v8"/>'}[name]||'')+'</svg>';
 const button=(a,t,cls='secondary',extra='')=>'<button type="button" class="'+cls+'" data-community="'+a+'" '+extra+'>'+t+'</button>';
 const info=(t,w=false)=>'<div class="community-info'+(w?' warn':'')+'">'+t+'</div>';
 const field=(id,label,value='',money=false)=>'<label for="'+id+'">'+label+'</label><input id="'+id+'" value="'+e(value)+'" '+(money?'inputmode="numeric"':'maxlength="80"')+' autocomplete="off">';
 const select=(id,label,options,chosen)=>'<label for="'+id+'">'+label+'</label><select id="'+id+'">'+Object.entries(options).map(([k,v])=>'<option value="'+e(k)+'" '+(k===chosen?'selected':'')+'>'+e(v)+'</option>').join('')+'</select>';
 const check=(id,label,on)=>'<label class="checkline"><input type="checkbox" id="'+id+'" '+(on?'checked':'')+'>'+label+'</label>';
 const footer=t=>'<p id="communityError" class="form-error" role="alert"></p><button type="submit" class="primary">'+t+'</button>';
 const val=id=>$(id).value.trim(),num=id=>D.number(val(id));
 function read(){const s=JSON.parse(localStorage.getItem(D.KEY));if(!s||s.schema!==2||!Array.isArray(s.tx)||!Array.isArray(s.members))throw Error('تعذر قراءة بيانات المعاينة. لم نُعِد ضبطها.');return s;}
 function scope(){const b=$('screen').querySelector('[data-action="memberPay"]');return b?b.dataset.id:'';}
 function owner(){if(scope())throw Error('هذا الإعداد لصاحب المحفظة في المعاينة.');}
 function modal(title,html){pending=null;$('dialogTitle').textContent=title;$('dialogBody').innerHTML=html;if(!$('dialog').open)$('dialog').showModal();$('dialog').scrollTop=0;}
 function error(err){const n=$('communityError');if(n)n.textContent=err.message||String(err);else modal('لم تُسجل العملية',info(e(err.message||String(err)),true));}
 function commit(action,payload){
  const before=read(),next=D.execute(before,action,payload),serialized=JSON.stringify(next);
  localStorage.setItem(D.KEY,serialized);
  // The existing core already listens to storage events; keep its state in sync.
  window.dispatchEvent(new StorageEvent('storage',{key:D.KEY,oldValue:JSON.stringify(before),newValue:serialized}));
  return next;
 }
 function settings(){
  owner();const s=read(),c=C.model(D,s);
  modal('إعداد أسرتي',info('أضف من ترغب فقط. لا نفترض وجود الوالدين، ولا نطلب سبب عدم إضافتهما. لا تُحذف الأعضاء أو أرصدتهم الموجودة عند تغيير هذه الخيارات.')+'<form class="community-form" data-community-form="settings">'+check('cMother','إظهار بند إضافة والدتي',c.settings.showMother)+check('cFather','إظهار بند إضافة والدي',c.settings.showFather)+check('cMarried','أنا متزوج / متزوجة — إظهار بند الزوجة أو الزوج',c.settings.married)+footer('حفظ اختيارات الأسرة')+'</form>');
 }
 function memberForm(id){
  owner();const s=read(),c=C.model(D,s),m=id?s.members.find(x=>x.id===id):{name:'',role:'child',color:'blue',limit:1000,period:'daily',perPayment:1000,allowed:['food','school','transport']};if(!m)throw Error('الفرد غير موجود.');
  const selected=c.relations[id]||'other',options=C.relationOptions(c);if(!options[selected])options[selected]=C.relations[selected]+' — عضو محفوظ';
  modal(id?'تعديل فرد الأسرة':'إضافة من تحب',info('لا حاجة لحساب بنكي في هذه المحاكاة. استخدم اسمًا مستعارًا؛ حسابات مستقلة وهوية فعلية غير مفعلة.')+'<form class="community-form" data-community-form="member" data-id="'+e(id||'')+'">'+select('cRelation','صلة الفرد بك',options,selected)+field('cName','الاسم التجريبي',m.name)+select('cRole','صفة الفرد',{adult:'فرد بالغ',child:'طفل بإشراف ولي الأمر'},m.role)+select('cColor','لون البطاقة',{pink:'وردي',blue:'أزرق',gold:'ذهبي'},m.color)+field('cLimit','المخصص بالريال',m.limit,true)+select('cPeriod','يتجدد',D.periods,m.period)+field('cPer','حد العملية الواحدة',m.perPayment,true)+'<fieldset><legend>فئات الإنفاق المسموحة</legend>'+Object.entries(D.categories).map(([k,v])=>'<label class="checkline"><input type="checkbox" name="cCategory" value="'+k+'" '+(m.allowed.includes(k)?'checked':'')+'>'+v+'</label>').join('')+'</fieldset>'+info('بندا الوالدين اختياريان. بند الزوجة / الزوج يظهر عند اختياره في إعداد أسرتي. المصروف السابق لا يُمحى بتعديل المخصص.')+footer('حفظ الفرد ومخصصه')+'</form>');
 }
 function house(){
  const s=read(),c=C.model(D,s),h=c.house,who=scope();
  modal('مصروف البيت',info('ميزانية يومية مشتركة للخضروات والفواكه واحتياجات البيت. تُخصم المشتريات من الرصيد مرة واحدة، وليس من المصروف الشخصي للفرد. لا ترحيل للفائض. يتجدد الحد عند استخدام المعاينة بعد منتصف الليل بتوقيت اليمن.')+'<div class="community-summary"><div><small>المخصص اليومي</small><b>'+D.money(h.limit)+'</b><small>ريال يمني</small></div><div><small>المتبقي اليوم</small><b>'+D.money(Math.max(0,h.limit-h.spent))+'</b><small>ريال يمني</small></div></div>'+info(h.enabled?'المخصص مفعّل. وجود حد متاح لا يغني عن وجود رصيد في المحفظة.':'فعّل المخصص وحدد من ينفق منه أولًا.',!h.enabled)+(h.enabled?button('housePay','شراء من مصروف البيت','primary'):'')+(!who?'<div class="community-settings">'+button('houseSettings','إعداد مصروف البيت')+'</div>':'')+'<p class="micro">الصرف اليوم: '+D.money(h.spent)+' ر.ي · محاكاة محلية فقط.</p>');
 }
 function houseSettings(){
  owner();const s=read(),h=C.model(D,s).house;
  modal('إعداد مصروف البيت','<form class="community-form" data-community-form="houseSettings">'+check('cHouseEnabled','تفعيل مصروف البيت اليومي',h.enabled)+field('cHouseLimit','الميزانية اليومية بالريال',h.limit,true)+field('cHousePer','الحد الأعلى للمشتريات في عملية واحدة',h.perPayment,true)+'<fieldset><legend>من ينفق منه بالإضافة إليك؟</legend>'+s.members.filter(m=>m.role==='adult').map(m=>'<label class="checkline"><input type="checkbox" name="cDelegate" value="'+e(m.id)+'" '+(h.members.includes(m.id)?'checked':'')+'>'+e(m.name)+(m.active?'':' — موقوف مؤقتًا')+'</label>').join('')+'</fieldset>'+info('التفويض للبالغين في هذه النسخة. إيقاف الفرد يمنعه من استخدام مخصص البيت أيضًا. تغيير الإعداد أو تعطيله لا يمحو المصروف المسجل اليوم.')+footer('حفظ الميزانية والتفويض')+'</form>');
 }
 function housePay(){
  const s=read(),h=C.model(D,s).house,who=scope(),ids={'':'صاحب المحفظة'};s.members.filter(m=>h.members.includes(m.id)&&m.role==='adult'&&m.active).forEach(m=>ids[m.id]=m.name);
  modal('شراء من مصروف البيت','<form class="community-form" data-community-form="housePay" data-key="'+D.uid()+'">'+(who?'<input type="hidden" id="cPayer" value="'+e(who)+'">':select('cPayer','معاينة الدفع باسم',ids,''))+select('cHouseCategory','نوع المشتريات',C.homeCategories,'produce')+field('cMerchant','اسم متجر تجريبي','بقالة الحي')+field('cHouseAmount','المبلغ بالريال','',true)+info('المتبقي اليوم '+D.money(h.limit-h.spent)+' ر.ي. لن ينقص المصروف الشخصي؛ هذا حد مشترك مستقل.')+footer('مراجعة المشتريات')+'</form>');
 }
 function social(kind='gift'){
  owner();const s=read(),c=C.model(D,s),labels=C.occasions;
  const records=s.tx.filter(t=>t.social);
  modal(kind==='rafd'?'الرفد — نفرح لبعض':'هدية من القلب',info('على قدر استطاعتك، بلا إحراج أو مقارنة. الهدية والرفد اختياريان، ولا يُسجلان دينًا على المستلم. هذه محاكاة، وليست جمع أموال أو إرسالًا إلى شخص حقيقي.')+'<form class="community-form" data-community-form="social" data-key="'+D.uid()+'">'+select('cOccasion','المناسبة',labels,kind)+field('cRecipient','اسم المستلم التجريبي','')+field('cSocialAmount','المبلغ بالريال','',true)+select('cEnvelope','لون الظرف',{pink:'وردي',blue:'أزرق',gold:'ذهبي'},kind==='rafd'?'gold':'pink')+'<label for="cNote">كلمة من القلب</label><textarea id="cNote" maxlength="160">'+(kind==='rafd'?'بارك الله لكما وبارك عليكما وجمع بينكما في خير.':'هدية بسيطة، ومحبة كبيرة. دمت بخير.')+'</textarea>'+info('المسجل هذا الشهر للهدية والرفد: '+D.money(C.monthSpent(D,s))+' ر.ي'+(c.socialLimit?' · حدك الاختياري: '+D.money(c.socialLimit)+' ر.ي':' · لم تحدد حدًا شهريًا.'))+footer('معاينة الهدية قبل التأكيد')+'</form><div class="community-settings">'+button('socialLimit','ميزانية الهدية والرفد')+'</div>'+(records.length?'<div class="community-history"><strong>سجلك الخاص — لا قائمة علنية بالمبالغ</strong>'+records.slice(0,8).map(t=>button('envelope',e(t.title)+' · '+D.money(Math.abs(t.amount))+' ر.ي','','data-id="'+e(t.id)+'"')).join('')+'</div>':''));
 }
 function limitForm(){owner();const s=read();modal('على قدر استطاعتك','<form class="community-form" data-community-form="socialLimit">'+field('cSocialLimit','حد شهري للهدية والرفد — اكتب 0 دون حد',C.model(D,s).socialLimit,true)+info('هذا سقف اختياري لا يحجز مالًا. يتجدد احتساب الشهر بتوقيت اليمن. العسب القديم ومصروف البيت غير داخلين في هذا السقف.')+footer('حفظ الحد')+'</form>');}
 function review(action,p){
  const title=action==='householdPay'?'تأكيد مشتريات البيت':'تأكيد '+C.occasions[p.occasion];
  modal(title,'<div class="community-thanks"><h3>'+e(action==='householdPay'?p.merchant:p.recipient)+'</h3><h2>'+D.money(p.amount)+' ر.ي</h2><p>'+e(p.note||C.homeCategories[p.category])+'</p></div>'+info('الخصم التجريبي يحدث مرة واحدة عند التأكيد فقط. لا يوجد تحويل مصرفي أو إرسال بين الأجهزة.',true)+'<p id="communityError" class="form-error" role="alert"></p>'+button('confirm','تأكيد المحاكاة','primary'));pending={action,p};
 }
 function envelope(id){
  owner();const t=read().tx.find(t=>t.id===id&&t.social);if(!t)throw Error('الهدية غير موجودة.');
  modal(C.occasions[t.social.occasion],'<div class="community-thanks"><div class="envelope '+e(t.social.color)+' opened"><span class="seal">و</span></div><h3>إلى '+e(t.social.recipient)+'</h3><p>'+e(t.social.note)+'</p><h2>'+D.money(Math.abs(t.amount))+' ر.ي</h2><p>سُجلت محليًا للتجربة فقط.</p></div>'+info('عرض هذا الظرف لا يخصم أي مبلغ جديد. لا إشعار استلام حقيقي ولا مطالبة للمستلم برد الرفد.')+button('thanks','معاينة بطاقة شكر','secondary','data-id="'+e(t.id)+'"')+'<div class="community-settings"><button type="button" class="secondary" data-inbox="detail" data-id="'+e(t.id)+'">رسالة العملية</button></div>');
 }
 function thanks(id){const t=read().tx.find(t=>t.id===id&&t.social);if(!t)return;modal('الكلمة الطيبة هدية','<div class="community-thanks"><h3>شكرًا من القلب 🌷</h3><p>محبتكم هي الهدية الأجمل، ومشاركتكم فرحتنا تسعدنا.</p></div>'+info('معاينة لصيغة شكر فقط؛ لم يرسل المستلم هذه الرسالة ولم تُرسل إليه. لا يظهر مبلغ في بطاقة الشكر.')+button('close','إغلاق'));}
 function ads(){owner();modal('إعلانات تحترم الأسرة',info('مساحة إعلانية تمثيلية فقط. لا يوجد معلن متعاقد أو عرض شراء حقيقي أو شبكة إعلانات مفعلة.')+'<div class="community-ad"><small>إعلان تجريبي · ليس عرضًا فعليًا</small><strong>مكان لمتجر محلي يخدم احتياجات البيت</strong><small>عروض واضحة دون تتبع الأرصدة أو مصروف الأطفال.</small></div>'+info('التصميم المقترح: إعلان واضح يمكن إخفاؤه في واجهة صاحب المحفظة؛ دون إعلانات في حسابات الأطفال أو رسائل الدفع أو أثناء التأكيد. التفعيل التجاري يحتاج سياسة خصوصية ومراجعة معلنين وضوابط المتاجر.')+button('hideAd','إخفاء المساحة لهذه الجلسة')+'<div class="community-settings">'+button('company','عن المساهمة في الشركة')+'</div>');}
 function company(){owner();modal('المساهمة في الشركة',info('باب المساهمة الاستثمارية غير مفتوح حاليًا. هذه صفحة توضيحية فقط، وليست عرض أسهم أو اكتتابًا أو طلب تبرع.',true)+'<div class="community-release"><p>أموال المحفظة تخص العملاء. الاستثمار في الشركة، إن أُجيز لاحقًا، يكون بعقد مستقل وحقوق ملكية ومخاطر واضحة، وليس بإيداع عادي في المحفظة.</p><p>يلزم أولًا تأسيس الكيان المناسب، ومراجعة محامٍ محلي والجهات المختصة، وتحديد التقييم والملكية والتصويت واستخدام الأموال وآلية الخروج. لا يوجد عائد مضمون.</p><p>لم نضف زر دفع أو شراء حصص أو نموذجًا لجمع بيانات المستثمرين. الرعاية الإعلانية شراء خدمة، وليست ملكية في الشركة.</p></div>'+button('close','فهمت'));}
 function updates(){modal('ما الجديد في وَصْل؟','<div class="community-release"><span class="community-badge">2.3.0 · الخميس 17 سبتمبر 2026</span><h3>محبة ومساعدة، دون ضغط</h3><p>هدية ورفد منفصلان عن العسب، ميزانية يومية للبيت وتفويض بالغين، تكوين اختياري للأسرة، حد اختياري لهدايا الشهر، ومعاينة بطاقة شكر تخفي المبلغ.</p><h3>القيمة المضافة المستهدفة</h3><p>تقليل الخلط بين مشتريات البيت والمصروف الشخصي، وتمكين من يشتري للأسرة، وتشجيع التهادي على قدر الاستطاعة. هذه أهداف تصميم وليست نتائج سوقية مقاسة.</p><h3>حدود النسخة</h3><p>كلها محاكاة محلية. الإعلانات تمثيلية، والمساهمة الاستثمارية مغلقة. لا حسابات بين الأجهزة أو ربط مصرفي أو APK جديد.</p></div>');}
 function enhance(){
  const screen=$('screen');if(!screen||!screen.firstElementChild)return;
  let s;try{s=read();}catch(_){return;}const c=C.model(D,s),who=scope(),isHome=!!screen.querySelector('.greeting'),isFamily=screen.querySelector('.page-title h2')?.textContent==='العائلة',isMore=screen.querySelector('.page-title h2')?.textContent==='المزيد';
  if(!screen.querySelector('.community-panel')){
   let html='';
   if(isHome)html='<h3>البيت، والناس الذين تحبهم</h3><p>مقاضي اليوم، هدية محبة، ورفد يشارك الفرحة.</p><div class="community-grid">'+button('house',icon('home')+'<b>مصروف البيت</b>','community-tile')+button('gift',icon('gift')+'<b>الهدية</b>','community-tile pink')+button('rafd',icon('rafd')+'<b>الرفد</b>','community-tile gold')+'</div><div class="community-settings">'+button('settings','إعداد أسرتي')+button('updates','ما الجديد؟')+'</div>'+(!hideAd?'<div class="community-ad"><small>مساحة إعلان تجريبية — ليست عرضًا حقيقيًا</small><strong>خدمات محلية تفيد أسرتك</strong>'+button('ads','سياسة الإعلانات')+'</div>':'');
   if(isFamily)html='<h3>عائلتك كما تختارها</h3><p>الوالدان اختياريان، وبند الزوجة أو الزوج حسب اختيارك. لا حذف تلقائي لأي عضو أو رصيد قديم.</p><div class="community-settings">'+button('settings','إعداد أسرتي')+button('house','مصروف البيت')+'</div>';
   if(isMore)html='<h3>المحبة والبيت</h3><div class="community-settings">'+button('house','مصروف البيت')+button('gift','الهدية')+button('rafd','الرفد')+button('ads','الإعلانات')+button('company','المساهمة في الشركة')+button('updates','ملخص التطوير')+'</div>';
   if(who&&c.house.enabled&&c.house.members.includes(who)&&s.members.some(m=>m.id===who&&m.active&&m.role==='adult'))html='<h3>مفوّض بمشتريات البيت</h3><p>هذا المخصص منفصل عن مصروفك الشخصي.</p>'+button('house','مصروف البيت');
   if(html){const section=document.createElement('section');section.className='community-panel';section.innerHTML=html;if(isHome){const tiles=screen.querySelector('.tiles');tiles?tiles.after(section):screen.append(section);}else if(isFamily)screen.querySelector('.page-title').after(section);else screen.append(section);}
  }
  screen.querySelectorAll('.member-card').forEach(card=>{const b=card.querySelector('[data-action="editMember"]'),r=b&&c.relations[b.dataset.id];if(r&&!card.querySelector('.community-badge')){const label=document.createElement('span');label.className='community-badge';label.textContent=C.relations[r]||'فرد الأسرة';card.querySelector('.member-info').append(label);}});
  screen.querySelectorAll('.foot-note').forEach(n=>{const value=n.innerHTML.replace(/2\.(?:0\.0|1\.[012]|2\.[01])/g,C.RELEASE).replace('تحديث الخميس 10 سبتمبر 2026','تحديث الخميس 17 سبتمبر 2026');if(value!==n.innerHTML)n.innerHTML=value;});
  document.querySelectorAll('#messagesBody .message-detail').forEach(article=>{if(article.querySelector('.household-receipt'))return;const row=[...article.querySelectorAll('dl>div')].find(n=>n.querySelector('dt')?.textContent==='رقم العملية');const id=row?.querySelector('dd')?.textContent;const t=s.tx.find(t=>t.id===id);if(t&&Number.isFinite(t.receipt?.householdLeft)){const n=document.createElement('p');n.className='household-receipt';n.textContent='المتبقي من مصروف البيت يوم العملية: '+D.money(t.receipt.householdLeft)+' ر.ي. لم يُخصم من المخصص الشخصي.';article.append(n);}});
 }
 // Replace only the member editor with an optional relationship-aware editor.
 document.addEventListener('click',ev=>{const b=ev.target.closest('[data-action="addMember"],[data-action="editMember"]');if(!b)return;ev.preventDefault();ev.stopImmediatePropagation();try{memberForm(b.dataset.id);}catch(err){error(err);}},true);
 document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-community]');if(!b)return;
  try{switch(b.dataset.community){
   case 'settings':settings();break;case 'house':house();break;case 'houseSettings':houseSettings();break;case 'housePay':housePay();break;
   case 'gift':social();break;case 'rafd':social('rafd');break;case 'socialLimit':limitForm();break;
   case 'ads':ads();break;case 'company':company();break;case 'updates':updates();break;
   case 'close':$('dialog').close();break;case 'envelope':envelope(b.dataset.id);break;case 'thanks':thanks(b.dataset.id);break;
   case 'hideAd':hideAd=true;document.querySelectorAll('.community-ad').forEach(n=>n.remove());$('dialog').close();break;
   case 'confirm':{if(!pending)break;const job=pending;pending=null;b.disabled=true;let out;try{out=commit(job.action,job.p);}catch(err){pending=job;b.disabled=false;throw err;}if(job.action==='socialGift')envelope(out.tx[0].id);else modal('تم تسجيل مشتريات البيت',info('خُصم '+D.money(job.p.amount)+' ر.ي من المحفظة مرة واحدة. المصروف الشخصي لم يتغير.')+'<div class="receipt"><button type="button" class="secondary" data-inbox="detail" data-id="'+e(out.tx[0].id)+'">رسالة العملية وتفاصيلها</button></div>');break;}
  }}catch(err){error(err);}
 });
 document.addEventListener('submit',ev=>{
  const form=ev.target;if(!form.dataset.communityForm)return;ev.preventDefault();
  try{switch(form.dataset.communityForm){
   case 'settings':owner();commit('communitySettings',{showMother:$('cMother').checked,showFather:$('cFather').checked,married:$('cMarried').checked});$('dialog').close();break;
   case 'member':owner();commit('communityMember',{id:form.dataset.id||null,name:val('cName'),role:val('cRole'),color:val('cColor'),relationship:val('cRelation'),limit:num('cLimit'),period:val('cPeriod'),perPayment:num('cPer'),allowed:[...form.querySelectorAll('[name=cCategory]:checked')].map(n=>n.value)});$('dialog').close();break;
   case 'houseSettings':owner();commit('householdSettings',{enabled:$('cHouseEnabled').checked,limit:num('cHouseLimit'),perPayment:num('cHousePer'),members:[...form.querySelectorAll('[name=cDelegate]:checked')].map(n=>n.value)});house();break;
   case 'housePay':review('householdPay',{memberId:val('cPayer'),category:val('cHouseCategory'),merchant:val('cMerchant'),amount:D.valid(num('cHouseAmount')),operationKey:form.dataset.key});break;
   case 'social':owner();review('socialGift',{recipient:val('cRecipient'),occasion:val('cOccasion'),color:val('cEnvelope'),note:val('cNote'),amount:D.valid(num('cSocialAmount'),1000000),operationKey:form.dataset.key});break;
   case 'socialLimit':owner();commit('socialLimit',{amount:num('cSocialLimit')});$('dialog').close();break;
  }}catch(err){error(err);}
 });
 const observer=new MutationObserver(enhance);observer.observe(document.body,{childList:true,subtree:true});enhance();
})();
