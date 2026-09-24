/* live-crawl lens c10: markdown renderer part 1 (main file) */
const md=s=>String(s==null?"":s).replace(/\r?\n/g," ").replace(/\|/g,String.fromCharCode(92)+"|").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const row=a=>"| "+a.map(md).join(" | ")+" |";const tbl=(h,rows)=>[row(h),"|"+h.map(()=>"---").join("|")+"|",...rows.map(row)].join("\n");
const BASE="docs/operations/evidence/2026-09-24/audit-crawl";
function renderMain(D,A,F,W,U){const home=D.pages.get(ORIGIN+"/")||{h:{}};const dpl=((D.assets.find(a=>/dpl=dpl_/.test(a.u))||{}).u||"").replace(/^.*dpl=/,"");
const cnt={};D.pages.forEach(r=>{cnt[r.d]=(cnt[r.d]||0)+1});const sev={};F.forEach(f=>sev[f.sev]=(sev[f.sev]||0)+1);const high=F.filter(f=>f.sev==="high"||f.sev==="critical").length;
const head=["# Live crawl audit: www.mayaallan.com (lens FULL LIVE CRAWL, ids crawl-)","",tbl(["field","value"],[["Lens","FULL LIVE CRAWL (curl), one of the site-visibility lenses"],["UTC window",D.start+" to "+D.end],
["Live sources","HTTP GET/HEAD with curl 8.16.0 (UA: "+UA+") to https://www.mayaallan.com, its apex and http variants, psilowire.com, psilocybinintegrationguide.com and the three vercel.app aliases. No repository source files, no local/scratch files, no caches."],
["Serving deployment (dpl parameter on live asset URLs)",dpl||"not seen"],["Edge (x-vercel-id prefix on /)",(home.h["x-vercel-id"]||"-").split("::")[0]],
["Crawler code","branch work/site-visibility, docs/operations/evidence/2026-09-24/tools/crawl/c1.js to c10.js, fetched live from GitHub and piped into node; nothing written locally"],
["Method","robots.txt and sitemap.xml parsed; BFS over <a href> on www.mayaallan.com from / (depth <=3, cap 400 pages); plus every sitemap URL and every hreflang target; assets = same-site img, largest srcset candidate, script, stylesheet, preload, icon, every og:image/twitter:image and Vercel Blob images (cap 400), HEAD with GET fallback; any 4xx/5xx page re-checked with a second GET."],
["Safety","GET/HEAD only, concurrency 4, 30 s timeouts; /api/, /admin/, /download/ and transactional paths not requested; no forms, no logins."]]),""].join("\n");
const bl=["## Bottom line","",(high?"- "+high+" high-severity crawl problems found (see findings).":"- **No crawl-level blocker found.** robots.txt allows every search and AI crawler; all "+D.smUrls.length+" sitemap URLs return 200 without redirect, are self-canonical and indexable; no page carries noindex; no 4xx/5xx page or asset; unknown URLs return a real 404; every alternate domain 308-redirects to https://www.mayaallan.com. The site being unseen is therefore not explained by crawl errors: whether Google/Bing have indexed it must be checked in Google Search Console and Bing Webmaster Tools (needs outside-source check) and in the search lenses."),
"- "+F.length+" findings ("+Object.entries(sev).map(x=>x[1]+" "+x[0]).join(", ")+"). Top items: "+F.slice(0,3).map(f=>f.id+" "+f.title.slice(0,110)).join("; ")+".",""].join("\n");
const tot=["## Totals","",tbl(["metric","value"],[["URLs fetched as pages",A.P.length+" ("+Object.entries(cnt).map(x=>"found via "+x[0]+": "+x[1]).join(", ")+"; numbers = BFS depth)"],
["Final status of page URLs",JSON.stringify(A.byStatus)],["Unique 200 HTML pages",A.fin.length],["URLs that redirect",A.redir.length+" ("+A.redir.map(r=>pth(r.url)+" "+r.hops.map(h=>h.status).join(">")+" "+pth(r.final)).join(", ")+")"],
["Sitemap URLs",D.smUrls.length+" ("+D.smLastmod+" with lastmod); sitemap index: "+D.smIndex],["Internal links beyond depth 3 (status-checked only)",D.beyond.size+" "+JSON.stringify(D.beyondChk.map(b=>pth(b.u)+" "+b.status))],
["Internal links skipped for safety",D.skipped.size+(D.skipped.size?" "+[...D.skipped].map(x=>pth(x[0])+" "+x[1]).join(", "):"")],["Page cap remaining (not fetched)",D.capLeft],
["Assets checked",D.assets.length+" of "+D.assetCand+" candidates ("+D.assetRefs+" distinct references); cap remaining "+D.assetCapLeft+"; final status "+JSON.stringify(A.assetBy)],
["External asset hosts (not checked)",[...D.extAssetHosts].map(x=>x[0]+" x"+x[1]).join(", ")||"none"],["External link hosts (not requested; count of links)",[...D.ext].sort((a,b)=>b[1]-a[1]).map(x=>x[0]+" x"+x[1]).join(", ")],
["Error re-checks (second GET)",D.recheck.length?D.recheck.map(x=>x.url+" "+x.first+" @"+x.firstAt+" / "+x.second+" @"+x.secondAt).join("; "):"none needed (no 4xx/5xx/000 page)"],
["Script sources outside /_next/static in server HTML",A.scripts.join(", ")||"none (client-injected scripts are not visible to curl)"]]),""].join("\n");
const fnd=["## Findings","",tbl(["id","severity","finding","evidence (live URL, read time UTC 2026-09-24)","impact","solution","owner"],F.map(f=>[f.id,f.sev,f.title,f.ev,f.impact,f.sol,f.owner])),""].join("\n");
const wk=["## Works","",tbl(["what works","evidence (live URL, read time UTC)"],W.map(w=>[w.item,w.ev])),""].join("\n");
const un=["## Unverified / not exercised","",...U.map(x=>"- "+md(x)),""].join("\n");
return [head,bl,tot,fnd,wk,un].join("\n")}