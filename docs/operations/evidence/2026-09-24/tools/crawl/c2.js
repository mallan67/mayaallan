/* live-crawl lens c2: HTML page parser */
function parse(html,base){const ld=[];
html.replace(/<script\b[^>]*type=["\x27]?application\/ld\+json["\x27]?[^>]*>([\s\S]*?)<\/script>/gi,(x,j)=>{try{const o=JSON.parse(j);const s=new Set();ldTypes(o,s);ld.push({ok:true,types:[...s]})}catch(e){ld.push({ok:false,err:String(e.message).slice(0,90)})}return ""});
const scriptSrcs=tagsOf(html,"script").map(a=>a.src).filter(Boolean);
const s=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi,"<svg></svg>");
const headEnd=s.search(/<\/head>/i);const titles=[];
s.replace(/<title\b[^>]*>([\s\S]*?)<\/title>/gi,(x,t,off)=>{titles.push({t:dec(t),inHead:headEnd<0||off<headEnd});return x});
const metas=[];s.replace(/<meta\b[^>]*>/gi,(x,off)=>{const a=attrs(x);a._inHead=headEnd<0||off<headEnd;metas.push(a);return x});
const mget=k=>metas.filter(a=>String(a.name||a.property||"").toLowerCase()===k);const links=tagsOf(s,"link");
const ht=attrs((s.match(/<html\b[^>]*>/i)||[""])[0]);
const h1s=[];s.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi,(x,t)=>{h1s.push(dec(t.replace(/<[^>]+>/g," ")));return x});
const anchors=tagsOf(s,"a").filter(a=>a.href!==undefined);
const canon=links.filter(l=>/(^|\s)canonical(\s|$)/i.test(l.rel||""));
const alts=links.filter(l=>/(^|\s)alternate(\s|$)/i.test(l.rel||"")&&l.hreflang);
const feeds=links.filter(l=>/alternate/i.test(l.rel||"")&&/rss|atom/i.test(l.type||"")).map(l=>l.href);
const assets=[];const add=(u,kind)=>{if(!u)return;if(/^(data|blob|mailto|tel|javascript):/i.test(u))return;try{assets.push({u:new URL(u,base).href,kind})}catch(e){}};
const lastSrc=ss=>{const c=String(ss).split(",").map(z=>z.trim().split(/\s+/)[0]).filter(Boolean);return c[c.length-1]};
tagsOf(s,"img").forEach(a=>{add(a.src,"img");if(a.srcset)add(lastSrc(a.srcset),"img-srcset")});
tagsOf(s,"source").forEach(a=>{add(a.src,"source");if(a.srcset)add(lastSrc(a.srcset),"source-srcset")});
tagsOf(s,"video").forEach(a=>{add(a.poster,"video-poster");add(a.src,"video")});tagsOf(s,"audio").forEach(a=>add(a.src,"audio"));
links.forEach(l=>{const r=String(l.rel||"").toLowerCase();if(/stylesheet|icon|manifest|preload|apple-touch|mask-icon/.test(r))add(l.href,"link:"+r.split(/\s+/)[0])});
scriptSrcs.forEach(u=>add(u,"script"));
const ogImg=mget("og:image").map(a=>a.content).filter(Boolean);const twImg=mget("twitter:image").map(a=>a.content).filter(Boolean);
ogImg.forEach(u=>add(u,"og:image"));twImg.forEach(u=>add(u,"twitter:image"));
const imgs=tagsOf(s,"img");const noAlt=imgs.filter(a=>a.alt===undefined).length;
const words=(dec(s.replace(/<head\b[\s\S]*?<\/head>/i," ").replace(/<[^>]+>/g," ")).match(/\S+/g)||[]).length;
return {title:(titles[0]||{}).t,titleCount:titles.length,titleInHead:(titles[0]||{}).inHead,
desc:mget("description").map(a=>a.content),descInHead:(mget("description")[0]||{})._inHead,
robots:[...mget("robots"),...mget("googlebot")].map(a=>a.name+"="+a.content),
canon:canon.map(l=>l.href),alts:alts.map(l=>({hl:l.hreflang,href:l.href})),lang:ht.lang||"",dir:ht.dir||"",
h1:h1s.length,h1s,ld,ogTitle:(mget("og:title")[0]||{}).content,ogDesc:(mget("og:description")[0]||{}).content,ogUrl:(mget("og:url")[0]||{}).content,ogType:(mget("og:type")[0]||{}).content,
ogImg,twImg,twCard:(mget("twitter:card")[0]||{}).content,anchors:anchors.map(a=>({href:a.href,rel:a.rel||""})),assets,feeds,
words,imgCount:imgs.length,noAlt,metaInHead:metas.filter(m=>m._inHead).length,metaTotal:metas.length}}