'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const css=fs.readFileSync(path.resolve(__dirname,'../safe-area-2.3.7.css'),'utf8');
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS '+name)};
test('demo ribbon has physical left safe area',()=>assert.match(css,/padding-left\s*:\s*max\(12px,\s*env\(safe-area-inset-left\)\)/));
test('demo ribbon has physical right safe area',()=>assert.match(css,/padding-right\s*:\s*max\(12px,\s*env\(safe-area-inset-right\)\)/));
test('left padding does not reuse right inset',()=>assert.doesNotMatch(css,/padding-left[^;]*safe-area-inset-right/));
test('right padding does not reuse left inset',()=>assert.doesNotMatch(css,/padding-right[^;]*safe-area-inset-left/));
console.log('\n'+count+' safe-area tests passed.');
