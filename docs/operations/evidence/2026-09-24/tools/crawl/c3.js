/* live-crawl lens c3: robots + sitemap + BFS crawl (depth<=3, cap 400) + sitemap-only + hreflang targets */
async function crawl(){const D={start:now(),pages:new Map(),linkedFrom:new Map(),skipped:new Map(),beyond:new Map(),ext:new Map(),fileLinks:[],capLeft:0};
D.rb=await req(ORIGIN+"/robots.txt");D.sm=await req(ORIGIN+"/sitemap.xml");
const sb=D.sm.body||"";D.smUrls=[...sb.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(x=>dec(x[1]));
D.smAlt=[...sb.matchAll(/<xhtml:link\b[^>]*>/g)].map(x=>attrs(x[0]));D.smIndex=/<sitemapindex/i.test(sb);
D.smLastmod=[...sb.matchAll(/<lastmod>/g)].length;D.smBytes=Buffer.byteLength(sb);
if(D.smIndex){for(const c of D.smUrls.slice()){const r=await req(c);const b=r.body||"";D.smUrls.push(...[...b.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(x=>dec(x[1])))}}
const rbb=String(D.rb.body||"");D.rbSitemaps=[...rbb.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map(x=>x[1]);D.rbGroups=[...rbb.matchAll(/^\s*user-agent:/gim)].length;
D.rbDisallow=[...new Set([...rbb.matchAll(/^\s*disallow:\s*(\S*)/gim)].map(x=>x[1]))];D.rbHost=[...rbb.matchAll(/^\s*host:\s*(\S+)/gim)].map(x=>x[1]);D.rbBytes=Buffer.byteLength(rbb);
D.sm.body=undefined;D.rb.body=undefined;const P=D.pages;
const record=(r,d)=>{const isH=/text\/html/i.test(r.ctype);const p=isH&&r.body?parse(r.body,r.final):null;const rec=Object.assign({},r,{body:undefined,bodyLen:Buffer.byteLength(r.body||""),d,p});P.set(r.url,rec);return rec};
const seen=new Set([ORIGIN+"/"]);let fr=[ORIGIN+"/"];
const harvest=(rec,expand)=>{if(!rec.p)return;for(const a of rec.p.anchors){const u=norm(a.href,rec.final);if(!u)continue;
if(!HOSTS.has(u.hostname)){D.ext.set(u.hostname,(D.ext.get(u.hostname)||0)+1);continue}
const k=u.href;if(!D.linkedFrom.has(k))D.linkedFrom.set(k,new Set());D.linkedFrom.get(k).add(rec.url);
const sr=skipReason(u);if(sr){D.skipped.set(k,sr);continue}
if(isAssetPath(u)){D.fileLinks.push({u:k,from:rec.url});continue}
if(!seen.has(k)){if(expand){seen.add(k);fr.push(k)}else D.beyond.set(k,(D.beyond.get(k)||0)+1)}}};
for(let d=0;d<=MAXDEPTH&&fr.length;d++){const room=Math.max(0,MAXPAGES-P.size);const b=fr.slice(0,room);D.capLeft+=fr.length-b.length;fr=[];
const rs=await pool(b,CONC,u=>req(u));for(const r of rs)harvest(record(r,d),d<MAXDEPTH)}
const more=async(list,label)=>{const l=[...new Set(list)].filter(u=>!P.has(u));const room=Math.max(0,MAXPAGES-P.size);D.capLeft+=Math.max(0,l.length-room);
const rs=await pool(l.slice(0,room),CONC,u=>req(u));for(const r of rs)harvest(record(r,label),false)};
await more(D.smUrls.map(u=>{const x=norm(u);return x?x.href:u}),"sitemap-only");
const alt=[];D.smAlt.forEach(a=>{const x=norm(a.href||"");if(x)alt.push(x.href)});
for(const r of P.values())if(r.p)r.p.alts.forEach(a=>{const x=norm(a.href,r.final);if(x&&HOSTS.has(x.hostname))alt.push(x.href)});
await more(alt,"hreflang-target");
for(const k of [...D.beyond.keys()])if(P.has(k))D.beyond.delete(k);
const bl=[...D.beyond.keys()];D.beyondChk=await pool(bl,CONC,async u=>{const r=await req(u,{nobody:true});return {u,status:r.status,at:r.at,final:r.final,nred:r.nred}});
D.recheck=[];for(const r of P.values())if(r.status>=400||r.status===0){const r2=await req(r.url,{nobody:true});D.recheck.push({url:r.url,first:r.status,firstAt:r.at,second:r2.status,secondAt:r2.at})}
return D}