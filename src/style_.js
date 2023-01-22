'use strict';
(w=>document.readyState=='loading'?addEventListener('DOMContentLoaded',w,{once:true}):w())((
	_,
	root=document.querySelector('script[src$="src/style_.js"]').outerHTML.match(/"(.*)src\/style_\.js"/)[1]
)=>((w=>(
	w.insertAdjacentHTML('afterbegin',`<style>
	header{position:-webkit-sticky;position:sticky;top:0;display:flex;flex-flow: wrap;align-items: end;z-index:10;pointer-events:none;}
	header>*{pointer-events:auto;}
	header>.button{font-size:large;margin:0;}
	header>a{align-self:start;}
	header>a::before{content:"";display:inline-block;height:4ex;width:4ex;margin-right:var(--border);border-radius:50%;vertical-align:middle;background:0 0/100% url(${root}img/icon.svg);}
	header>nav{background:#f88c;}
	</style><header>
	<a class="button" href="${root}">McbeEringi</a>
	<button class="button"><ruby>三<rp>(</rp><rt>MENU</rt><rp>)</rp></ruby></button>
	<nav class="button">
		<a>aaa</a>
	</nav>
	</header>`),
	w.insertAdjacentHTML('beforeend',`<hr><footer>2018~ @McbeEringi.｡:+*<br>MIT License</footer>`)
))(document.body),(w=>(
	w.addEventListener('touchstart',_=>_,{passive:true}),
	w.setAttribute('lang',navigator.language.slice(0,2))
))(document.documentElement)));
