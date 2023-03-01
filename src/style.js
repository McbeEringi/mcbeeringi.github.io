'use strict';
self.root='./'+document.querySelector('script[src$="src/style.js"]').outerHTML.match(/"(.*)src\/style\.js"/)[1];
(w=>document.readyState=='loading'?addEventListener('DOMContentLoaded',w,{once:true}):w())((_,a='</a><a class="button" href="')=>((w=>(
	w.insertAdjacentHTML('afterbegin',`<style>
		header{position:-webkit-sticky;position:sticky;top:8px;z-index:10;pointer-events:none;}
		header>.button{font-size:large;margin:0;pointer-events:auto;}header>.button::before{content:"";display:inline-block;height:4ex;width:4ex;margin-right:var(--border);border-radius:50%;vertical-align:middle;background:0 0/100% url(${root}img/icon.svg);}
		header>.input{position:absolute;width:max(32ex,33%);max-height:calc(calc(100vh - 100%) - 16px);overflow:auto;transform:translateX(-5%);transition:.2s;opacity:0;visibility:hidden;pointer-events:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(12ex,100%),1fr));gap:var(--border);}header>.input>*{text-align:center;margin:0;}
		header>button:hover+nav,header>button:focus+nav,nav:hover,nav:focus-within{top:unset;transform:translateY(0);opacity:1;visibility:visible;pointer-events:auto;}
	</style><header><button class="button">McbeEringi</button><nav class="input">`+`
	,Top;sky/,Sky Stuff;apps/,Apps;ta/,TA.js;petit/,PetitJS;mc/,Minecraft;
	translate.google.com/translate?sl=ja&tl=en&u=${encodeURIComponent(location)},Translate;twitter.com/mcbeeringi,Twitter;github.com/mcbeeringi,GitHub;qiita.com/mcbeeringi,Qiita;youtube.com/@mcbeeringi,YouTube;
	</nav></header>`.replace(/(.*?),(.*?);/g,(_,x,y,p)=>`<a class="button" href="${p<60?root:'https://'}${x}">${y}</a>`)),
	w.insertAdjacentHTML('beforeend',`<hr><footer>2018~ @McbeEringi.｡:+*<br>MIT License</footer>`)
))(document.body),(w=>(w.addEventListener('touchstart',_=>_,{passive:true}),w.setAttribute('lang',navigator.language.slice(0,2))))(document.documentElement)));
