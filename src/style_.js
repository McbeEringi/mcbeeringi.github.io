'use strict';
const _init=()=>{
	document.body.insertAdjacentHTML('afterbegin',``);
	document.body.insertAdjacentHTML('beforeend',`<hr>
<footer>
	2018~ @McbeEringi.｡:+*<br>
	MIT License<br><br>
	<a href="https://twitter.com/mcbeeringi"><img src="https://icongr.am/material/twitter.svg?color=ffffff" alt="twitter icon" width="32" height="32"></a>
	<a href="https://github.com/mcbeeringi"><img src="https://icongr.am/material/github.svg?color=ffffff" alt="github icon" width="32" height="32"></a>
</footer>`);
	document.querySelectorAll('a').forEach(e=>e.addEventListener('touchstart',()=>{},{passive:true}));
};
if(document.readyState=='loading')window.addEventListener('DOMContentLoaded',_init,{once:true});else _init();
