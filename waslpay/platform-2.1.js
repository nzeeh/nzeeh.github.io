/* Installable responsive shell only. Demo state remains local; no payment queue. */
'use strict';
(() => {
 const $ = id => document.getElementById(id), root = document.documentElement;
 const screen = $('screen'), version = '2.1.0';
 let installPrompt = null, registration = null, applyingUpdate = false;
 const downloadIcon='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg>';
 const installed = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
 const apple = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
 function setPlatformState(){
  document.querySelectorAll('[data-platform-action="install"]').forEach(b=>{
   b.hidden=installed();b.innerHTML=downloadIcon+'<span>ثبّت التطبيق</span>';
  });
  root.classList.toggle('standalone',installed());
 }
 function group(nodes,cls){
  const parent=nodes[0] && nodes[0].parentNode;if(!parent)return null;
  const div=document.createElement('div');div.className=cls;parent.insertBefore(div,nodes[0]);nodes.forEach(n=>div.appendChild(n));return div;
 }
 function enhance(){
  const first=screen.firstElementChild;if(!first||first.dataset.portable==='yes')return;
  observer.disconnect();
  const title=screen.querySelector('.page-title h2');
  const routes={'العائلة':'family','العسب والعيدية':'gifts','صندوق هدف الأسرة':'goals','المزيد':'more','الحساب والخصوصية':'profile','سجل العمليات':'activity','طلبات الأسرة':'requests','الخدمات اليومية':'services'};
  const current=screen.querySelector('.member-view-hero')?'member':screen.querySelector('.greeting')?'home':(routes[title&&title.textContent]||location.hash.slice(1)||'home');
  screen.dataset.page=current;
  if(current==='home' && screen.querySelector('.greeting')){
   const nodes=[...screen.children].filter(n=>!n.classList.contains('greeting'));
   if(nodes.length){
    const grid=document.createElement('div');grid.className='dashboard-grid';screen.insertBefore(grid,nodes[0]);
    let block=null;
    nodes.forEach(n=>{if(!block||n.classList.contains('heading')){block=document.createElement('section');block.className='dashboard-block';grid.appendChild(block);}block.appendChild(n);});
   }
  }else if(current==='family'){
   group([...screen.querySelectorAll(':scope > .member-card')],'cards-grid');
   const summary=screen.querySelector('.summary-grid');if(summary)summary.classList.add('family-summary');
   const after=[...screen.children];const idx=after.findIndex(n=>n.classList.contains('cards-grid'));
   if(idx>=0)group(after.slice(idx+1),'family-footer');
  }else if(current==='gifts'){
   const hero=screen.querySelector(':scope > .gift-hero'), button=screen.querySelector(':scope > [data-action="newGift"]');
   if(hero && button){const hint=button.nextElementSibling;const composer=group([button,...(hint&&hint.classList.contains('hint')?[hint]:[])],'gift-composer');group([hero,composer],'gift-controls');}
   group([...screen.querySelectorAll(':scope > .gift-mini')],'cards-grid');
  }else if(current==='goals'){
   group([...screen.querySelectorAll(':scope > .card')],'cards-grid');
  }
  screen.querySelectorAll('.foot-note').forEach(n=>{if(n.textContent.includes('2.0.0'))n.innerHTML=n.innerHTML.replace('2.0.0',version)+'<br>نسخة ويب للهواتف والأجهزة اللوحية · بيانات محلية فقط';});
  document.querySelectorAll('#nav .nav-button').forEach(n=>n.classList.contains('active')?n.setAttribute('aria-current','page'):n.removeAttribute('aria-current'));
  if(screen.firstElementChild)screen.firstElementChild.dataset.portable='yes';
  observer.observe(screen,{childList:true});
 }
 const observer=new MutationObserver(enhance);enhance();
 function viewport(){
  const vv=window.visualViewport;
  root.style.setProperty('--vv-height',(vv?vv.height:innerHeight)+'px');
  root.style.setProperty('--vv-top',(vv?vv.offsetTop:0)+'px');
  const editing=document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  root.classList.toggle('keyboard-open',!!(vv && editing && vv.height<innerHeight*.8));
 }
 window.addEventListener('resize',viewport,{passive:true});
 if(window.visualViewport){visualViewport.addEventListener('resize',viewport,{passive:true});visualViewport.addEventListener('scroll',viewport,{passive:true});}
 document.addEventListener('focusin',viewport);document.addEventListener('focusout',()=>setTimeout(viewport,50));viewport();
 function installHelp(platform){
  const isApple=platform==='apple';
  $('installSteps').innerHTML=isApple?
   '<li>افتح رابط وَصْل في <strong>Safari</strong>، وليس داخل تطبيق المراسلة.</li><li>اضغط <strong>مشاركة</strong>، ثم <strong>إضافة إلى الشاشة الرئيسية</strong>. قد تجد المشاركة أو الإضافة داخل «المزيد».</li><li>فعّل <strong>فتح كتطبيق ويب</strong> إذا ظهر، ثم اضغط <strong>إضافة</strong>.</li><li>ستجد أيقونة وَصْل على شاشة iPhone أو iPad.</li>':
   '<li>افتح الرابط في <strong>Chrome</strong> على الهاتف أو الجهاز اللوحي.</li><li>اضغط <strong>تثبيت التطبيق</strong> هنا عند إتاحته، أو افتح قائمة المتصفح <strong>⋮</strong>.</li><li>اختر <strong>إضافة إلى الشاشة الرئيسية</strong> ثم <strong>تثبيت</strong>، بحسب إصدار المتصفح.</li><li>افتح وَصْل من أيقونته. لا يلزم حساب ChatGPT.</li>';
  document.querySelectorAll('[data-platform-action="tab"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.platform===platform)));
  $('nativeInstall').hidden=isApple || !installPrompt;
 }
 async function tryInstall(){
  if(installPrompt){
   const event=installPrompt;installPrompt=null;
   try{await event.prompt();await event.userChoice;}catch(_){openInstall();}
   $('nativeInstall').hidden=true;
  }else openInstall();
 }
 function openInstall(){installHelp(apple()?'apple':'android');if($('dialog').open)$('dialog').close();if(!$('installDialog').open)$('installDialog').showModal();}
 document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-platform-action]');if(!b)return;
  switch(b.dataset.platformAction){
   case 'install': openInstall();break;
   case 'native-install':tryInstall();break;
   case 'close-install':$('installDialog').close();break;
   case 'tab':installHelp(b.dataset.platform);break;
   case 'update':if(registration&&registration.waiting){applyingUpdate=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});}break;
  }
 });
 $('installDialog').addEventListener('click',ev=>{if(ev.target===$('installDialog')){const r=ev.target.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)ev.target.close();}});
 window.addEventListener('beforeinstallprompt',ev=>{ev.preventDefault();installPrompt=ev;setPlatformState();});
 window.addEventListener('appinstalled',()=>{installPrompt=null;$('installDialog').close();setPlatformState();});
 const media=matchMedia('(display-mode: standalone)');if(media.addEventListener)media.addEventListener('change',setPlatformState);
 function network(){ $('connectionBar').hidden=navigator.onLine; }
 window.addEventListener('online',network);window.addEventListener('offline',network);network();setPlatformState();
 if('serviceWorker' in navigator && (location.protocol==='https:' || ['localhost','127.0.0.1'].includes(location.hostname))){
  window.addEventListener('load',async()=>{
   try{
    registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
    const update=()=>{$('updateBar').hidden=!(registration.waiting && navigator.serviceWorker.controller);};update();
    registration.addEventListener('updatefound',()=>{const w=registration.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed')update();});});
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(applyingUpdate)location.reload();});
   }catch(_){$('offlineHint').textContent='تعذر تجهيز النسخة المحفوظة. تظل المعاينة متاحة مع الاتصال بالإنترنت.';}
  });
 }
})();
