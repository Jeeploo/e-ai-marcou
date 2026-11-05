const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const filename=path.resolve(__dirname,'../store/useAccessibilityStore.ts');
function load(){const m=new Module(filename,module);m.filename=filename;m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,filename);return m.exports;}
test('updates clamp numbers, reject invalid enums and keep actions',()=>{const {useAccessibilityStore:s}=load();s.getState().updateValue('textSize',999);assert.equal(s.getState().textSize,200);s.getState().updateValue('daltonism','evil');assert.equal(s.getState().daltonism,'none');assert.equal(typeof s.getState().resetAll,'function');});
test('profiles are deduplicated and hydration excludes conflicting fonts',()=>{const {sanitizeA11yPreferences, useAccessibilityStore:s}=load();assert.deepEqual(sanitizeA11yPreferences({activeProfiles:['motor','motor','invalid']}),{activeProfiles:['motor']});s.getState().hydrateSettings({dyslexiaFont:true,legibleFont:true});assert.equal(s.getState().dyslexiaFont&&s.getState().legibleFont,false);});
test('local persistence hydrates before subscribing and reset is saved',()=>{const {startAccessibilityPersistence,useAccessibilityStore:s}=load();const data=new Map([['test',JSON.stringify({textSize:150})]]);const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};const stop=startAccessibilityPersistence('test',storage);assert.equal(s.getState().textSize,150);s.getState().resetAll();assert.equal(JSON.parse(data.get('test')).textSize,100);stop();});
test('unavailable or malformed storage leaves in-memory controls usable',()=>{const {startAccessibilityPersistence,useAccessibilityStore:s}=load();const stop=startAccessibilityPersistence('test',{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});s.getState().updateValue('textSize',150);assert.equal(s.getState().textSize,150);stop();const stop2=startAccessibilityPersistence('test',{getItem:()=>'{bad',setItem(){}});assert.equal(typeof s.getState().resetAll,'function');stop2();});
test('partial hydration cannot leave both font modes active',()=>{const {useAccessibilityStore:s}=load();s.getState().updateValue('dyslexiaFont',true);s.getState().hydrateSettings({legibleFont:true});assert.equal(s.getState().dyslexiaFont&&s.getState().legibleFont,false);});

test('SSR renders without window, document or localStorage',()=>{
 const savedTS=Module._extensions['.ts'],savedTSX=Module._extensions['.tsx'];
 const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,f);
 Module._extensions['.ts']=compile;Module._extensions['.tsx']=compile;
 try{const React=require('react'),{renderToString}=require('react-dom/server');const Widget=require(path.resolve(__dirname,'../components/AccessibilityWidget.tsx')).default;assert.equal(renderToString(React.createElement(Widget)),'');}
 finally{Module._extensions['.ts']=savedTS;Module._extensions['.tsx']=savedTSX;}
});
