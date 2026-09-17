/* WaslPay 2.3.0: local-only household and occasion actions. No remote accounts. */
'use strict';
const WaslCommunity230=(()=>{
 const RELEASE='2.3.0';
 const relations={other:'فرد آخر',mother:'والدتي',father:'والدي',wife:'الزوجة',husband:'الزوج',son:'ابني',daughter:'ابنتي',sibling:'أخ / أخت'};
 const occasions={gift:'هدية محبة',rafd:'رفد عرس',graduation:'هدية تخرج',newborn:'تهنئة مولود',wellness:'سلامتك'};
 const homeCategories={produce:'خضروات',fruit:'فواكه',staples:'مواد غذائية',cleaning:'مستلزمات النظافة',gas:'غاز واحتياجات البيت'};
 function model(D,s){
  const c=JSON.parse(JSON.stringify(s.community||{}));
  c.settings=Object.assign({showMother:false,showFather:false,married:false},c.settings);
  c.relations=c.relations||{};
  c.house=Object.assign({enabled:false,limit:3000,perPayment:3000,spent:0,key:D.periodKey('daily'),members:[]},c.house);
  if(c.house.key!==D.periodKey('daily')){c.house.key=D.periodKey('daily');c.house.spent=0;}
  c.socialLimit=Number.isSafeInteger(c.socialLimit)?c.socialLimit:0;
  return c;
 }
 function monthSpent(D,s){const k=D.periodKey('monthly');return (s.tx||[]).filter(t=>t.social&&D.periodKey('monthly',t.at)===k).reduce((a,t)=>a+Math.abs(t.amount),0);}
 function relationOptions(c){return Object.fromEntries(Object.entries(relations).filter(([k])=>k==='mother'?c.settings.showMother:k==='father'?c.settings.showFather:['wife','husband'].includes(k)?c.settings.married:true));}
 function text(v,label,max=80){v=String(v||'').trim();if(v.length<2||v.length>max)throw Error('اكتب '+label+' من حرفين إلى '+max+' حرفًا.');return v;}
 function member(s,id){const m=s.members.find(m=>m.id===id);if(!m)throw Error('الفرد غير موجود.');return m;}
 function unique(s,id){if(typeof id!=='string'||id.length<8||id.length>100)throw Error('معرف العملية غير صالح. أعد فتح النموذج.');if(s.tx.some(t=>t.operationKey===id))throw Error('سُجلت هذه العملية بالفعل؛ لن تُخصم مرتين.');}
 function run(D,base,s,action,p={}){
  const next=JSON.parse(JSON.stringify(s));next.community=model(D,s);const c=next.community;
  if(action==='communitySettings'){
   c.settings={showMother:p.showMother===true,showFather:p.showFather===true,married:p.married===true};return next;
  }
  if(action==='communityMember'){
   const r=p.relationship||'other';
   if(!Object.prototype.hasOwnProperty.call(relations,r))throw Error('صلة الأسرة غير صالحة.');
   const existing=p.id&&c.relations[p.id];
   if(!Object.prototype.hasOwnProperty.call(relationOptions(c),r)&&existing!==r)throw Error('فعّل بند هذا الفرد في إعداد أسرتي أولًا.');
   if(['mother','father','wife','husband','sibling'].includes(r)&&p.role!=='adult')throw Error('اختر صفة فرد بالغ لهذه الصلة.');
   if(['son','daughter'].includes(r)&&!['adult','child'].includes(p.role))throw Error('اختر صفة الفرد.');
   const out=base(next,'member',p);const m=p.id?member(out,p.id):out.members[out.members.length-1];out.community.relations[m.id]=r;return out;
  }
  if(action==='householdSettings'){
   D.valid(p.limit,1000000);D.valid(p.perPayment,1000000);
   if(p.limit<c.house.spent)throw Error('لا يمكن خفض المخصص إلى أقل من مصروف اليوم.');
   if(p.perPayment>p.limit)throw Error('حد العملية لا يتجاوز المخصص اليومي للبيت.');
   const ids=[...new Set(p.members||[])];ids.forEach(id=>{if(member(s,id).role!=='adult')throw Error('تفويض البيت في هذه النسخة للبالغين فقط.');});
   Object.assign(c.house,{enabled:p.enabled===true,limit:p.limit,perPayment:p.perPayment,members:ids});return next;
  }
  if(action==='socialLimit'){
   if(p.amount!==0)D.valid(p.amount,2000000);
   if(p.amount>0&&p.amount<monthSpent(D,s))throw Error('الحد أقل من الهدايا والرفد المسجلة هذا الشهر.');
   c.socialLimit=p.amount;return next;
  }
  if(action==='householdPay'){
   unique(s,p.operationKey);D.valid(p.amount);
   if(!c.house.enabled)throw Error('مصروف البيت غير مفعّل.');
   if(!Object.prototype.hasOwnProperty.call(homeCategories,p.category))throw Error('اختر فئة من مصروفات البيت.');
   let m=null;
   if(p.memberId){m=member(s,p.memberId);if(!m.active||m.role!=='adult'||!c.house.members.includes(m.id))throw Error('هذا الفرد غير مفوّض حاليًا بالصرف من البيت.');}
   if(p.amount>c.house.perPayment)throw Error('تجاوزت حد العملية الواحدة لمصروف البيت.');
   if(p.amount>c.house.limit-c.house.spent)throw Error('المتبقي من مصروف البيت اليوم لا يكفي.');
   const merchant=text(p.merchant,'اسم متجر تجريبي',60);
   const out=base(next,'pay',{amount:p.amount,title:'مصروف البيت · '+homeCategories[p.category]+' · '+merchant,kind:'householdPay',merchant});
   out.community.house.spent+=p.amount;
   const t=out.tx[0];t.operationKey=p.operationKey;t.memberId=m?m.id:'';
   t.receipt=Object.assign({},t.receipt,{version:1,payer:m?m.name:'صاحب المحفظة',memberId:t.memberId,target:merchant,type:'دفع من مصروف البيت',status:'مسجلة تجريبيًا',source:'الرصيد المشترك · مصروف البيت',walletAfter:out.wallet,sourceAfter:out.wallet,allowanceLeft:null,period:null,category:homeCategories[p.category],fee:0,principal:p.amount,householdLeft:out.community.house.limit-out.community.house.spent,householdLimit:out.community.house.limit});
   return out;
  }
  if(action==='socialGift'){
   unique(s,p.operationKey);D.valid(p.amount,1000000);
   if(!Object.prototype.hasOwnProperty.call(occasions,p.occasion))throw Error('اختر مناسبة صحيحة.');
   if(!['pink','blue','gold'].includes(p.color))throw Error('لون الظرف غير صالح.');
   const recipient=text(p.recipient,'اسم مستلم تجريبي',40),note=text(p.note,'تهنئة',160);
   if(c.socialLimit&&monthSpent(D,s)+p.amount>c.socialLimit)throw Error('تجاوزت الحد الشهري الذي اخترته للهدية والرفد.');
   const out=base(next,'pay',{amount:p.amount,title:occasions[p.occasion]+' إلى '+recipient,kind:p.occasion==='rafd'?'rafd':'socialGift'});
   const t=out.tx[0];t.operationKey=p.operationKey;t.social={recipient,note,occasion:p.occasion,color:p.color};
   t.receipt=Object.assign({},t.receipt,{version:1,payer:'صاحب المحفظة',memberId:'',target:recipient,type:occasions[p.occasion],status:'مسجلة تجريبيًا',source:'رصيد صاحب المحفظة · هدية / رفد',walletAfter:out.wallet,sourceAfter:out.wallet,allowanceLeft:null,period:null,category:null,fee:0,principal:p.amount});
   return out;
  }
  return base(s,action,p);
 }
 return {RELEASE,relations,occasions,homeCategories,model,monthSpent,relationOptions,run};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=WaslCommunity230;
if(typeof document!=='undefined'&&typeof Wasl!=='undefined'){
 const original=Wasl.execute;Wasl.execute=(s,a,p)=>WaslCommunity230.run(Wasl,original,s,a,p);
}
