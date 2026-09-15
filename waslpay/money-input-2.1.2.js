/* WaslPay 2.1.2 mobile amount-entry compatibility patch. No payment logic. */
'use strict';
const WaslMoneyInput212=(()=>{
 const RELEASE='2.1.2';
 function normalize(rootNode){
  const apply=input=>{if(input&&input.getAttribute&&input.getAttribute('inputmode')==='decimal')input.setAttribute('inputmode','numeric');};
  apply(rootNode);
  if(rootNode&&rootNode.querySelectorAll)rootNode.querySelectorAll('input[inputmode="decimal"]').forEach(apply);
 }
 function stamp(rootNode){
  if(!rootNode||!rootNode.querySelectorAll)return;
  rootNode.querySelectorAll('.foot-note').forEach(n=>{
   if(/2\.(?:0\.0|1\.1)/.test(n.textContent||''))n.innerHTML=n.innerHTML.replace(/2\.(?:0\.0|1\.1)/g,RELEASE);
  });
 }
 function enhance(rootNode){normalize(rootNode);stamp(rootNode);}
 return {RELEASE,normalize,stamp,enhance};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=WaslMoneyInput212;
if(typeof document!=='undefined'){
 WaslMoneyInput212.enhance(document);
 const observer=new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)WaslMoneyInput212.enhance(n);}))); 
 observer.observe(document.body,{childList:true,subtree:true});
}
