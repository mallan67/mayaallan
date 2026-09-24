/* live-crawl lens c5: analysis of the live crawl data D -> metrics A */
function analyze(D){const A={};const P=[...D.pages.values()];const fk=u=>{const r=D.pages.get(u);return key(r?r.final:u)};
A.P=P;A.byStatus={};P.forEach(r=>{A.byStatus[r.status]=(A.byStatus[r.status]||0)+1});
A.redir=P.filter(r=>r.nred>0);A.multiHop=P.filter(r=>r.nred>1);A.loops=P.filter(r=>/redirect/i.test(r.err||""));A.err=P.filter(r=>r.status>=400||r.status===0);
A.assetBy={};D.assets.forEach(a=>{const s=(a.r2||a.r).status;A.assetBy[s]=(A.assetBy[s]||0)+1});A.assetErr=D.assets.filter(a=>{const s=(a.r2||a.r).status;return s>=400||s===0});
const fin=new Map();P.filter(r=>r.status===200&&r.p).forEach(r=>{if(!fin.has(key(r.final)))fin.set(key(r.final),r)});A.fin=[...fin.values()];
const noidx=r=>/noindex/i.test((r.h["x-robots-tag"]||"")+" "+r.p.robots.join(" "));A.noindex=A.fin.filter(noidx);A.indexable=A.fin.filter(r=>!noidx(r));
const inb=new Map();for(const [k,v] of D.linkedFrom){const t=fk(k);for(const s of v){if(fk(s)===t)continue;if(!inb.has(t))inb.set(t,new Set());inb.get(t).add(s)}}A.inb=t=>(inb.get(key(t))||new Set()).size;
A.smSet=new Set(D.smUrls.map(key));A.sm=D.smUrls.map(u=>{const n=norm(u);const r=n&&D.pages.get(n.href);return {u,r,self:!!(r&&r.p&&r.p.canon.length&&key(r.p.canon[0])===key(r.final)),noidx:!!(r&&r.p&&noidx(r)),inb:r?A.inb(r.final):0}});
A.smBad=A.sm.filter(x=>!x.r||x.r.status!==200||x.r.nred>0||x.noidx||!x.self);A.notInSm=A.indexable.filter(r=>!A.smSet.has(key(r.final)));
A.noCanon=A.fin.filter(r=>!r.p.canon.length);A.multiCanon=A.fin.filter(r=>r.p.canon.length>1);A.nonSelf=A.fin.filter(r=>r.p.canon.length&&key(r.p.canon[0])!==key(r.final));
const grp=f=>{const m=new Map();A.indexable.forEach(r=>{const v=f(r);if(!v)return;if(!m.has(v))m.set(v,[]);m.get(v).push(r)});return [...m].filter(x=>x[1].length>1)};
A.noTitle=A.fin.filter(r=>!r.p.title);A.multiTitle=A.fin.filter(r=>r.p.titleCount>1);A.dupTitle=grp(r=>r.p.title);
A.noDesc=A.fin.filter(r=>!r.p.desc.length||!r.p.desc[0]);A.multiDesc=A.fin.filter(r=>r.p.desc.length>1);A.dupDesc=grp(r=>r.p.desc[0]);
A.longTitle=A.fin.filter(r=>(r.p.title||"").length>60);A.longDesc=A.fin.filter(r=>(r.p.desc[0]||"").length>160);A.shortDesc=A.fin.filter(r=>r.p.desc[0]&&r.p.desc[0].length<70);
A.h1bad=A.fin.filter(r=>r.p.h1!==1);A.ldBad=A.fin.filter(r=>r.p.ld.some(l=>!l.ok));A.noLd=A.fin.filter(r=>!r.p.ld.length);A.noLang=A.fin.filter(r=>!r.p.lang);
A.slow=P.filter(r=>r.t>2.5);const ts=A.fin.map(r=>r.t).sort((a,b)=>a-b);A.tMed=ts[Math.floor(ts.length/2)]||0;A.tMax=ts[ts.length-1]||0;A.tMin=ts[0]||0;
A.cc={};A.xvc={};A.fin.forEach(r=>{const c=r.h["cache-control"]||"(none)";A.cc[c]=(A.cc[c]||0)+1;const x=r.h["x-vercel-cache"]||"(none)";A.xvc[x]=(A.xvc[x]||0)+1});
A.noOgImg=A.fin.filter(r=>!r.p.ogImg.length);A.noOgTitle=A.fin.filter(r=>!r.p.ogTitle);A.twNoOg=A.noOgImg.filter(r=>r.p.twImg.length);
A.bodyMeta=A.fin.filter(r=>!r.p.titleInHead||!r.p.descInHead);
A.orphans=A.fin.filter(r=>key(r.final)!==key(ORIGIN+"/")&&A.inb(r.final)===0);A.weak=A.fin.filter(r=>A.inb(r.final)===1);
A.thin=A.fin.filter(r=>r.p.words<150);
A.withAlts=A.fin.filter(r=>r.p.alts.length);A.enNoAlts=A.fin.filter(r=>!r.p.alts.length&&A.sm.some(x=>x.r===r)&&/hreflang/.test(""));
const byKey=new Map(A.fin.map(r=>[key(r.final),r]));A.nonRecip=[];A.withAlts.forEach(r=>r.p.alts.forEach(a=>{const t=byKey.get(key(new URL(a.href,r.final).href));if(!t){A.nonRecip.push({from:r.final,hl:a.hl,to:a.href,why:"target not fetched/200"});return}if(key(t.final)===key(r.final))return;if(!t.p.alts.some(b=>key(new URL(b.href,t.final).href)===key(r.final)))A.nonRecip.push({from:r.final,hl:a.hl,to:t.final,why:"target has no return hreflang"})}));
A.langMis=[];A.withAlts.forEach(r=>{const self=r.p.alts.find(a=>a.hl!=="x-default"&&key(new URL(a.href,r.final).href)===key(r.final));if(self&&self.hl.toLowerCase()!==r.p.lang.toLowerCase())A.langMis.push({u:r.final,hl:self.hl,lang:r.p.lang})});
A.heNoRtl=A.fin.filter(r=>/^he/i.test(r.p.lang)&&!/rtl/i.test(r.p.dir));
A.link2redir=[];for(const [k,v] of D.linkedFrom){const r=D.pages.get(k);if(r&&r.nred>0)A.link2redir.push({k,final:r.final,hops:r.hops.map(h=>h.status).join(">"),from:[...v]})}
A.scripts=[...new Set(D.assets.filter(a=>a.kinds.includes("script")).map(a=>a.u).filter(u=>!/\/_next\/static\//.test(u)))];
A.uaHead={};D.ua.forEach(u=>{const k=u.n;A.uaHead[k]=A.uaHead[k]||{n:0,head:0,st:new Set()};A.uaHead[k].n++;if(u.titleInHead&&u.descInHead)A.uaHead[k].head++;A.uaHead[k].st.add(u.status)});
A.t404=D.tests.filter(t=>t.g==="soft404");A.soft404=A.t404.filter(t=>t.r.status===200);A.wk=D.tests.filter(t=>t.g==="wellknown");
return A}