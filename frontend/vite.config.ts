import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
function appShell(): Plugin {
  return {
    name: "marcou-app-shell",
    apply: "build",
    generateBundle(_, bundle) {
      const files = [
        "/",
        "/index.html",
        "/manifest.webmanifest",
        "/icons/icon-192.png",
        "/icons/icon-512.png",
        ...Object.keys(bundle)
          .filter((name) => /\.(js|css)$/.test(name))
          .map((name) => "/" + name),
      ];
      const version = "marcou-" + Date.now();
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: `const CACHE=${JSON.stringify(version)};const FILES=${JSON.stringify(files)};self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)))});self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('marcou-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));return}if(FILES.includes(url.pathname)){event.respondWith(caches.match(event.request,{ignoreVary:true}).then(cached=>cached||fetch(event.request)))}});`,
      });
    },
  };
}
export default defineConfig({ plugins: [react(), tailwindcss(), appShell()] });
