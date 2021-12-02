'use strict';
const _init=()=>{
	document.body.insertAdjacentHTML('afterbegin',`<style>
	header{position:fixed;top:0;right:0;z-index:10;text-align:right;}
	header>input{appearance:none;-webkit-appearance:none;display:inline-block;width:48px;height:48px;margin:8px;border-radius:50%;background:0 0/100% url("https://mcbeeringi.github.io/img/icon.svg");box-shadow:0 0 4px #888;}
	header>nav{transform:translateX(100%)scale(.5);opacity:0;visibility:hidden;transition:.2s;}
	header>nav>*{display:block;text-align:center;padding:8px 32px;margin:2px 8px;border-radius:16px;background-color:#4448;transform:scale(1);transition:inherit;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}
	header>nav>*:hover{background-color:#444c;transform:scale(1.1);}
	header>input:checked+nav{transform:translateX(0)scale(1);opacity:1;visibility:visible;}
	.lang{background-repeat:no-repeat;background-position:center;background-size:contain;background-image:url(https://icongr.am/material/translate.svg?color=ffffff);text-decoration:none;}
</style>
<header><input type="checkbox"><nav>
	<a href="/">Top</a>
	<a href="https://mcbeeringi.github.io/sky/">Sky</a>
	<a href="https://mcbeeringi.github.io/mc/">MC</a>
	<a href="https://mcbeeringi.github.io/apps/">Apps</a>
	<a class="lang">　</a>
</nav></header>`);
	document.body.insertAdjacentHTML('beforeend',`<hr>
<footer>
	2018~ @McbeEringi.｡:+*<br>
	MIT License<br><br>
	<a href="https://twitter.com/mcbeeringi"><img src="https://icongr.am/material/twitter.svg?color=ffffff" alt="twitter icon" width="32" height="32"></a>
	<a href="https://github.com/mcbeeringi"><img src="https://icongr.am/material/github.svg?color=ffffff" alt="github icon" width="32" height="32"></a>
</footer>`);
	document.querySelectorAll('a.lang').forEach(e=>e.href='https://translate.google.com/translate?sl=ja&tl=en&u='+encodeURIComponent(location.href));
	document.querySelectorAll('a').forEach(e=>e.addEventListener('touchstart',()=>{},{passive:true}));
	document.documentElement.setAttribute('lang',window.navigator.language.slice(0,2));
};
if(document.readyState=='loading')window.addEventListener('DOMContentLoaded',_init,{once:true});else _init();
