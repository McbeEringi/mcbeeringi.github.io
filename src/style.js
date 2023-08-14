'use strict';
(d=>(self.root=d.querySelector('script[src$="src/style.js"]').outerHTML.match(/"(.*)src\/style\.js"/)[1]||'./',(w=>d.readyState=='loading'?addEventListener('DOMContentLoaded',w,{once:true}):w())(h=>(h=d.documentElement).addEventListener('touchstart',_=>_,{passive:true},h.setAttribute('lang',navigator.language.slice(0,2)),[['afterbegin',`<style>
	header{position:-webkit-sticky;position:sticky;top:8px;z-index:10;pointer-events:none;}
	header>button.zab{margin:0;pointer-events:auto;height:8ex;width:8ex;background:var(--c) 0 0/100% url(${root}img/icon_.svg);}@media(prefers-color-scheme:dark){header>button.zab{background-image:url(${root}img/icon!_.svg);}}
	header>nav{position:absolute;width:max(32ex,33%);max-height:calc(calc(100vh - 100%) - 16px);padding-top:var(--bor);box-sizing:border-box;overflow:auto;transition:.5s;transform:scale(110%);filter:opacity(0)blur(8px);visibility:hidden;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(12ex,100%),1fr));gap:var(--bor);}
	header>nav>*.zab{text-align:center;margin:0;}
	header>button:hover+*,header>button:focus+*,nav:hover,nav:focus-within{transform:none;filter:none;visibility:visible;pointer-events:auto;}
</style><header><button class="zab" title="Menu"></button><nav>`+`
,Top;sky/,Sky Stuff;apps/,Apps;ta/,TA.js;petit/,PetitJS;mc/,Minecraft;
translate.google.com/translate?sl=ja&tl=en&u=${encodeURIComponent(location)},Translate;misskey.io/@mcbeeringi,misskey.io;github.com/mcbeeringi,GitHub;qiita.com/mcbeeringi,Qiita;youtube.com/@mcbeeringi,YouTube;twitter.com/mcbeeringi,Twitter;
</nav></header>`.replace(/(.*?),(.*?);/g,(_,x,y,p)=>`<a class="zab" href="${p<60?root:'https://'}${x}">${y}</a>`)],['beforeend',`<hr><footer>2018~ @McbeEringi.｡:+*<br>MIT License</footer>`]].map(x=>d.body.insertAdjacentHTML(...x))))))(document);