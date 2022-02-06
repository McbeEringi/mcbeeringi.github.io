'use strict';
const _init=()=>{
	document.body.insertAdjacentHTML('afterbegin',`<style>
	header{position:fixed;top:0;right:0;z-index:10;max-height:100%;display:flex;flex-direction:column;align-items:flex-end;}
	header>input{appearance:none;-webkit-appearance:none;flex-shrink:0;display:block;width:48px;height:48px;margin:8px;border-radius:50%;background:0 0/100% url("https://mcbeeringi.github.io/img/icon.svg");box-shadow:0 0 4px var(--g0);}
	header>nav{transform:translateX(100%);visibility:hidden;transition:.2s;overflow:auto;}
	header>nav>*{display:block;text-align:center;padding:8px 32px;margin:4px 8px;border-radius:8px;background:var(--g2) no-repeat center/contain;transform:scale(1);transition:inherit;text-decoration:none;font-weight:bold;text-decoration:none;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}
	header>nav>*:hover{background-color:var(--g1);transform:scale(1.1);}
	header>input:checked+nav{transform:translateX(0);visibility:visible;}
	.lang{background-image:url(https://icongr.am/material/translate.svg?color=ffffff);}
</style>
<header><input type="checkbox"><nav>
	<a href="/">Top</a>
	<a href="https://mcbeeringi.github.io/sky/">Sky</a>
	<a href="https://mcbeeringi.github.io/apps/">Apps</a>
	<a href="https://mcbeeringi.github.io/mc/">MC</a>
	<a class="lang">　</a>
	<a href="https://twitter.com/mcbeeringi" style="background-image:url(https://icongr.am/material/twitter.svg?color=ffffff);">　</a>
	<a href="https://github.com/mcbeeringi" style="background-image:url(https://icongr.am/material/github.svg?color=ffffff);">　</a>
</nav></header>`);
	document.body.insertAdjacentHTML('beforeend',`<hr><footer>2018~ @McbeEringi.｡:+*<br>MIT License</footer>`);
	document.querySelectorAll('a.lang').forEach(e=>e.href='https://translate.google.com/translate?sl=ja&tl=en&u='+encodeURIComponent(location.href));
	document.querySelectorAll('a').forEach(e=>e.addEventListener('touchstart',()=>{},{passive:true}));
	document.documentElement.setAttribute('lang',window.navigator.language.slice(0,2));
};
if(document.readyState=='loading')window.addEventListener('DOMContentLoaded',_init,{once:true});else _init();
