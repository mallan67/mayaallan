/* live-crawl lens c1: helpers. Runs via: fetch c1..c6 from branch work/site-visibility | node - (no local files) */
const {execFile}=require("child_process");
const UA="Mozilla/5.0 (compatible; MayaAllanLiveAudit/1.0; owner-requested crawl) curl/8.16.0";
const ORIGIN="https://www.mayaallan.com";const HOSTS=new Set(["www.mayaallan.com","mayaallan.com"]);
const MAXPAGES=400,MAXASSETS=400,MAXDEPTH=3,CONC=4;
const now=()=>new Date().toISOString().replace(/\.\d+Z$/,"Z");
function run(args){return new Promise(res=>{execFile("curl",args,{encoding:"utf8",maxBuffer:256*1024*1024,timeout:45000,windowsHide:true},(err,out,se)=>res({err:err?String(se||err.message||"").trim().split("\n").pop():null,out:out||""}))})}
const W="\n@@M@@%{http_code}|%{num_redirects}|%{time_total}|%{time_starttransfer}|%{size_download}|%{content_type}|%{url_effective}";
async function req(url,o={}){const method=o.method||"GET";const args=["-sS","-m","30","--compressed","-A",o.ua||UA,"-w",W];
if(o.follow!==false)args.push("-L","--max-redirs","10");
if(method==="HEAD")args.push("-I");else{args.push("-D","-");if(o.nobody)args.push("-o","NUL")}
args.push(url);const at=now();const r=await run(args);let out=r.out;const mi=out.lastIndexOf("\n@@M@@");
let m=["0","0","0","0","0","",url];if(mi>=0){m=out.slice(mi+6).split("|");out=out.slice(0,mi)}
const hops=[];let pos=0;
while(out.startsWith("HTTP/",pos)){let e=out.indexOf("\r\n\r\n",pos);if(e<0)e=out.length;const lines=out.slice(pos,e).split("\r\n");pos=Math.min(out.length,e+4);const h={};
for(const l of lines.slice(1)){const i=l.indexOf(":");if(i>0){const k=l.slice(0,i).trim().toLowerCase(),v=l.slice(i+1).trim();h[k]=h[k]?h[k]+", "+v:v}}
hops.push({status:+(lines[0].split(" ")[1]||0),loc:h.location||"",h})}
const last=hops[hops.length-1]||{h:{}};
return{url,at,method,status:+m[0],nred:+m[1],t:+m[2],ttfb:+m[3],size:+m[4],ctype:m[5]||"",final:m[6]||url,hops,h:last.h,body:(method==="HEAD"||o.nobody)?"":out.slice(pos),err:r.err}}
async function pool(items,n,fn){const res=new Array(items.length);let i=0;await Promise.all(Array.from({length:n},async()=>{while(i<items.length){const k=i++;res[k]=await fn(items[k],k)}}));return res}
function dec(s){return String(s==null?"":s).replace(/&#x([0-9a-f]+);/gi,(x,h)=>String.fromCharCode(parseInt(h,16))).replace(/&#(\d+);/g,(x,d)=>String.fromCharCode(+d)).replace(/&quot;/g,String.fromCharCode(34)).replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim()}
function attrs(tag){const a={};const re=/([^\s=<>\/"\x27]+)\s*=\s*(?:"([^"]*)"|\x27([^\x27]*)\x27|([^\s>"\x27]+))/g;let x;while((x=re.exec(tag))){const k=x[1].toLowerCase();if(!(k in a))a[k]=dec(x[2]!==undefined?x[2]:x[3]!==undefined?x[3]:x[4])}return a}
function tagsOf(html,n){return (html.match(new RegExp("<"+n+"(?=[ \t\n\r/>])[^>]*>","gi"))||[]).map(attrs)}
function ldTypes(o,acc){if(Array.isArray(o))o.forEach(v=>ldTypes(v,acc));else if(o&&typeof o==="object"){if(o["@type"])[].concat(o["@type"]).forEach(t=>acc.add(String(t)));for(const k of Object.keys(o))if(k!=="@context")ldTypes(o[k],acc)}}
function norm(href,base){try{const u=base?new URL(href,base):new URL(href);if(!/^https?:$/.test(u.protocol))return null;u.hash="";return u}catch(e){return null}}
function key(u){try{const x=new URL(u);x.hash="";let p=x.pathname;if(p.length>1&&p.endsWith("/"))p=p.slice(0,-1);return x.protocol+"//"+x.host+p+x.search}catch(e){return String(u)}}
function skipReason(u){const p=u.pathname.toLowerCase();if(/^\/(api|admin|download)(\/|$)/.test(p))return "robots-disallowed + safety (/"+p.split("/")[1]+"/)";if(/(checkout|cart|\bbuy\b|purchase|\/pay\b|paypal|\/order|subscribe|login|logout|sign-?in|sign-?up|\/auth|unsubscribe)/.test(p))return "safety (transactional path)";return null}
const isAssetPath=u=>/\.(png|jpe?g|gif|webp|avif|svg|ico|pdf|mp3|m4a|m4b|wav|ogg|mp4|webm|mov|zip|epub|css|js|mjs|woff2?|ttf|otf|xml|txt|json|webmanifest)$/i.test(u.pathname);