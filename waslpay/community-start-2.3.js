/* Only initialise a brand-new local demo. Never reset or migrate existing data. */
'use strict';
try{
 const key='waslpay-family-demo-v2';
 if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify({schema:2,wallet:125000,familyName:'عائلتي',members:[],gifts:[],requests:[],goals:[],tx:[]}));
}catch(_){/* Existing core shows its storage warning when storage is unavailable. */}
