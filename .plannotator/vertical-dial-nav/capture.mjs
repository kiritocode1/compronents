import { execFileSync } from 'node:child_process';
import { copyFileSync, writeFileSync } from 'node:fs';
const directory=new URL('.',import.meta.url).pathname;
function browser(session,...args){return execFileSync('agent-browser',['--session',session,...args],{encoding:'utf8',timeout:60000});}
const evidence=[];
for(const [width,height,label] of [[1280,577,'AI Coder'],[1280,577,'Digital Artist'],[1280,577,'Curious'],[390,844,'AI Coder'],[390,844,'Digital Artist']]){
 for(const [kind,session] of [['source','compronents-vertical-dial-source'],['local','compronents-vertical-dial']]){
  browser(session,'set','viewport',String(width),String(height));
  browser(session,'find','role','link','click','--name',label);
  const nav=kind==='source'?'nav':'nav[aria-label="Section navigation"]';
  browser(session,'wait','--fn',`(()=>{const nav=document.querySelector('${nav}');const link=nav?.querySelector('[aria-current]');return document.fonts.status==='loaded' && link?.textContent===${JSON.stringify(label)} && getComputedStyle(link).transform==='matrix(1.06, 0, 0, 1.06, 0, 0)' && !nav.getAnimations({subtree:true}).some(a=>a.playState==='running')})()`);
  browser(session,'wait','--fn',kind==='local'?'document.querySelector("[data-dial-scroll-root]").scrollTop===([...document.querySelectorAll("nav[aria-label=\\\"Section navigation\\\"] a")].findIndex(e=>e.getAttribute("aria-current")))*innerHeight':'Math.abs(document.getElementById(document.querySelector("nav [aria-current]").hash.slice(1)).getBoundingClientRect().top)<1');
  if(kind==='source')browser(session,'eval','document.querySelectorAll("#__framer-editorbar-container,#__framer-badge-container").forEach(e=>e.style.display="none")');
  const screenshot=JSON.parse(browser(session,'screenshot','--json'));
  const state=label.toLowerCase().replaceAll(' ','-');
  const filename=`${kind}-${width}-${state}.png`;
  copyFileSync(screenshot.data.path,directory+filename);
  evidence.push({kind,width,height,label,filename});
 }
}
writeFileSync(directory+'captures.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence,null,2));
