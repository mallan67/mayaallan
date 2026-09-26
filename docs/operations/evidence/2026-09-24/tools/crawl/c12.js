/* live-crawl lens c12: runner (crawl, assets/tests, second timing pass, analysis, render, emit files) */
(async()=>{const D=await crawl();await assetsAndTests(D);
const fu=[...new Set([...D.pages.values()].filter(r=>r.status===200&&r.p).map(r=>r.final))];D.pass2=await pool(fu,CONC,u=>req(u,{nobody:true}));D.end=now();
const A=analyze(D);A.slow=A.slow.concat(D.pass2.filter(r=>r.t>2.5).map(r=>Object.assign({},r,{pass2:true})));
let F=findings(D,A);F=findings2(D,A,F);F=findings3(D,A,F);const W=works(D,A),U=unverified(D,A);
const parts=renderParts(D,A);const idx=["## Evidence files","",...parts.map(p=>"- `"+p.path+"`: "+(p.c.match(/^## .*$/gm)||[]).map(x=>x.slice(3)).join("; ")),"- Crawler code: `docs/operations/evidence/2026-09-24/tools/crawl/` (gitsave.sh, c1.js to c12.js)",""].join("\n");
const files=[...parts,{path:BASE+".md",c:renderMain(D,A,F,W,U)+"\n"+idx}];
process.stdout.write("@@SUMMARY@@"+JSON.stringify({start:D.start,end:D.end,sizes:files.map(f=>[f.path,Buffer.byteLength(f.c)]),ua:A.uaHead,F:F.map(f=>({id:f.id,sev:f.sev,title:f.title,ev:f.ev.slice(0,420),impact:f.impact,sol:f.sol,owner:f.owner})),W:W.map(w=>({item:w.item,ev:w.ev.slice(0,220)})),U}));
files.forEach(f=>process.stdout.write("@@FILE@@"+f.path+"\n"+f.c))})();