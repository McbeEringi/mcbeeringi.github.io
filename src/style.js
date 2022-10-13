'use strict';
(w=>document.readyState=='loading'?addEventListener('DOMContentLoaded',w,{once:true}):w())(()=>{
	document.body.insertAdjacentHTML('afterbegin',`<style>
	header{position:fixed;top:0;right:0;z-index:10;max-height:100%;display:flex;flex-direction:column;align-items:end;pointer-events:none;}header>*{pointer-events:initial;}
	header>button{appearance:none;-webkit-appearance:none;flex-shrink:0;display:block;width:48px;height:48px;margin:0;padding:0;border:0;color:#0000;background:no-repeat center/70% url(https://icongr.am/feather/menu.svg?color=ffffff);}
	header>nav{transform:translateX(100%);visibility:hidden;transition:.2s;overflow:auto;}
	header>nav>*{display:block;text-align:center;padding:8px 32px;margin:4px 8px;border-radius:8px;background:var(--g2) no-repeat center/contain;transform:scale(1);transition:inherit;text-decoration:none;font-weight:bold;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);}
	header>nav>*:hover{background-color:var(--g1);transform:scale(1.1);}
	header>button:hover+nav,header>button:focus+nav,nav:hover,nav:focus-within{transform:translateX(0);visibility:visible;}
</style>
<header><button>Menu</button><nav>
	<a href="/">Top</a>
	<a href="https://mcbeeringi.github.io/sky/">Sky Stuff</a>
	<a href="https://mcbeeringi.github.io/apps/">Apps</a>
	<a href="https://mcbeeringi.github.io/ta/">TA.js</a>
	<a href="https://mcbeeringi.github.io/petit/">PetitJS</a>
	<a href="https://mcbeeringi.github.io/mc/">MC</a>
	<a href="https://translate.google.com/translate?sl=ja&tl=en&u=${encodeURIComponent(location.href)}" style="background-image:url(https://icongr.am/feather/globe.svg?color=ffffff);color:#0000">Translate</a>
	<a href="https://twitter.com/mcbeeringi" style="background-image:url(https://icongr.am/feather/twitter.svg?color=ffffff);color:#0000">Twitter</a>
	<a href="https://github.com/mcbeeringi" style="background-image:url(https://icongr.am/feather/github.svg?color=ffffff);color:#0000">GitHub</a>
</nav></header>`);
	document.body.insertAdjacentHTML('beforeend',`<hr><footer>2018~ @McbeEringi.｡:+*<br>MIT License</footer>`);
	(x=>(
		x.addEventListener('touchstart',_=>_,{passive:true}),
		x.setAttribute('lang',navigator.language.slice(0,2))
	))(document.documentElement);
});
