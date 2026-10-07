// 条文スナイパー：オフライン用（保存済みファイルをすぐ表示し、通信できるときに裏で最新版へ更新）
const CACHE='jsniper-v2.2';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const FONT=/^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);const same=url.origin===self.location.origin;
  if(!same&&!FONT.test(req.url))return;
  const key=same&&req.mode==='navigate'?'./index.html':req;
  const net=fetch(req).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();return caches.open(CACHE).then(c=>c.put(key,cp)).then(()=>res,()=>res)}return res}).catch(()=>null);
  e.waitUntil(net);
  e.respondWith(caches.match(key,{ignoreSearch:same}).then(hit=>hit||net.then(r=>r||new Response(same?'オフラインです。一度オンラインで開いてください。':'',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}))));
});
