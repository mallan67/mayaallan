/* live-crawl lens c4: assets (HEAD, GET fallback), host/protocol/slash/case/soft-404/well-known tests, UA parity */
async function assetsAndTests(D){const am=new Map();const add=(u,k,f)=>{if(!am.has(u))am.set(u,{kinds:new Set(),from:new Set()});am.get(u).kinds.add(k);am.get(u).from.add(f)};
for(const r of D.pages.values())if(r.p)r.p.assets.forEach(a=>add(a.u,a.kind,r.url));D.fileLinks.forEach(f=>add(f.u,"a-href-file",f.from));
const extA=new Map(),cand=[];for(const [u,v] of am){let h;try{h=new URL(u).hostname}catch(e){continue}
const social=[...v.kinds].some(k=>/og:image|twitter:image/.test(k));if(HOSTS.has(h)||social)cand.push({u,v,social});else extA.set(h,(extA.get(h)||0)+1)}
cand.sort((a,b)=>b.social-a.social);D.assetRefs=am.size;D.assetCand=cand.length;D.extAssetHosts=extA;
const list=cand.slice(0,MAXASSETS);D.assetCapLeft=cand.length-list.length;
D.assets=await pool(list,CONC,async c=>{const r=await req(c.u,{method:"HEAD"});let r2=null;if(r.status>=400||r.status===0)r2=await req(c.u,{nobody:true});return {u:c.u,kinds:[...c.v.kinds],from:[...c.v.from],r,r2}});
const rnd=Date.now().toString(36);const M="https://www.mayaallan.com";const T=[
["proto","http://www.mayaallan.com/"],["proto","http://mayaallan.com/"],["apex","https://mayaallan.com/"],["apex","https://mayaallan.com/about"],["apex","http://mayaallan.com/books?ref=audit"],
["alt-domain","https://psilowire.com/"],["alt-domain","https://www.psilowire.com/"],["alt-domain","http://psilowire.com/"],["alt-domain","https://psilocybinintegrationguide.com/"],["alt-domain","https://www.psilocybinintegrationguide.com/"],["alt-domain","https://psilocybinintegrationguide.com/about"],
["vercel-domain","https://mayaallan.vercel.app/"],["vercel-domain","https://mayaallan-mallan.vercel.app/"],["vercel-domain","https://mayaallan-git-main-mallan.vercel.app/"],
["slash",M+"/about/"],["slash",M+"/books/"],["slash",M+"/blog/affirmations-vs-integration/"],["case",M+"/About"],["case",M+"/media/mushroom-healing"],
["dup",M+"/index.html"],["dup",M+"/?utm_source=audit"],["dup",M+"//about"],
["soft404",M+"/zz-audit-missing-"+rnd],["soft404",M+"/books/zz-audit-missing-"+rnd],["soft404",M+"/blog/zz-audit-missing-"+rnd],["soft404",M+"/media/zz-audit-missing-"+rnd],["soft404",M+"/scenarios/zz-audit-missing-"+rnd],["soft404",M+"/es/zz-audit-missing-"+rnd],
["wellknown",M+"/favicon.ico"],["wellknown",M+"/llms.txt"],["wellknown",M+"/llms-full.txt"],["wellknown",M+"/rss.xml"],["wellknown",M+"/feed.xml"],["wellknown",M+"/manifest.webmanifest"],["wellknown",M+"/apple-touch-icon.png"],["wellknown",M+"/.well-known/security.txt"]];
D.tests=await pool(T,CONC,async([g,u])=>{const r=await req(u);const isH=/text\/html/i.test(r.ctype);const p=isH&&r.body?parse(r.body,r.final):null;
return {g,u,r:Object.assign({},r,{body:undefined,bodyLen:Buffer.byteLength(r.body||"")}),p:p&&{title:p.title,canon:p.canon,robots:p.robots,h1s:p.h1s.slice(0,2),words:p.words,lang:p.lang}}});
const UAS={googlebot:"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",bingbot:"Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",chrome:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",audit:UA};
D.ua=await pool(Object.entries(UAS),2,async([n,ua])=>{const r=await req(M+"/",{ua});const p=r.body?parse(r.body,r.final):null;
return {n,status:r.status,at:r.at,t:r.t,len:Buffer.byteLength(r.body||""),titleInHead:p&&p.titleInHead,descInHead:p&&p.descInHead,metaInHead:p&&p.metaInHead,metaTotal:p&&p.metaTotal,title:p&&p.title,canon:p&&p.canon,h1:p&&p.h1,ld:p&&p.ld.length,words:p&&p.words,cache:r.h["x-vercel-cache"]||""}});
D.end=now();return D}