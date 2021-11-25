'use strict';
document.body.insertAdjacentHTML('afterbegin',`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300&family=M+PLUS+Rounded+1c&display=swap" media="print" onload="this.media='all'">
<style>
:root,.style{background:#222;font-family:"M PLUS Rounded 1c",sans-serif;color:#fff;text-shadow:0 0 6px #222,0 0 2px #000;word-wrap:break-word;image-rendering:crisp-edges;image-rendering:pixelated;}
a:link{color:#aef;}a:link:hover{color:#8af;}a:link:active{color:#48f;}
a:visited{color:#caf;}a:visited:hover{color:#a8f;}a:visited:active{color:#84f;}
@media(max-width:512px){li a{display:block;min-height:24px;padding:8px;margin:8px auto;border-radius:6px;background:#8884;}}
#bg{position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:-16;pointer-events:none;user-select:none;-webkit-user-select:none;}
.stuff>a{display:inline-block;width:150px;margin:5px;vertical-align:top;transition:.2s;white-space:pre-wrap;}
@media(max-width:504px){.stuff{text-align:center;}}
.stuff>a::before{content:"";display:block;height:150px;border-radius:20%;background:no-repeat center/cover var(--img);background-color:var(--col);}
.stuff>a::after{content:var(--entxt,var(--txt));display:inline-block;font-size:small;text-decoration:none;color:#fff;width:100%;}.stuff:lang(ja)>a::after{content:var(--txt);}
.stuff>a:hover,.stuff>a:focus{transform:scale(1.05);filter:brightness(1.2)saturate(1.2)drop-shadow(0 0 8px #fea);}

header{position:-webkit-sticky;position:sticky;top:8px;left:0;width:100%;height:48px;background:#8888;line-height:48px;border-radius:8px;user-select:none;-webkit-user-select:none;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:16;}
header>*{display:inline-block;position:absolute;}
header>a{left:0;text-decoration:none;font-size:large;color:#ddd !important;}header>a::before{content:"";display:inline-block;width:48px;height:48px;vertical-align:bottom;background:no-repeat center/80% url("https://mcbeeringi.github.io/img/6x6_.png");}
header>nav{right:0;margin-right:8px;}#hnavcb{display:none;}
@media(max-width:512px){
	header>nav{margin-right:unset;}
	#hnavcb~label{display:inline-block;width:48px;height:48px;background:#0006;border-radius:8px;background:no-repeat top right #0006;touch-action:manipulation;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48px'%3E%3Cpath d='M10,14l28,0m-28,10l28,0m-28,10l28,0' stroke='%23fff' stroke-width='1.5px'/%3E%3C/svg%3E");}
	#hnavcb~div{position:absolute;top:0;right:0;transform:scale(.5);transform-origin:top right;box-sizing:border-box;padding:32px;border-radius:8px;text-align:center;background:#4448;opacity:0;pointer-events:none;transition:.2s;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);visibility:hidden;}
	#hnavcb~div>*{display:block;font-size:x-large;}
	#hnavcb:checked~label{position:fixed;top:0;left:0;width:100vw;height:100vh;border-radius:unset;background-image:unset;}
	#hnavcb:checked~div{opacity:1;pointer-events:unset;transform:scale(1)translateY(56px);visibility:visible;}
}
.lang{display:inline-block;vertical-align:middle;min-width:20px;height:20px;margin:4px;filter:brightness(1.4);background:no-repeat center url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20px' height='20px'%3E%3Ccircle r='9' cx='10' cy='10' style='fill:transparent;stroke:%238af;stroke-width:1'/%3E%3Cellipse cx='10' cy='10' rx='5' ry='9' style='fill:transparent;stroke:%238af;stroke-width:1'/%3E%3Cpath d='M10,1 L10,19 M2.2,5 L17.8,5 M1,10 L19,10 M2.5,15 L17.8,15' style='stroke:%238af;stroke-width:1'/%3E%3C/svg%3E");}.lang:hover{filter:none;}
footer,.box{width:100%;background:#8888;border-radius:8px;box-sizing:border-box;padding:16px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}footer,.c{text-align:center;}footer{margin-top:16px;}
.box{background:#8884;}.title{font-size:calc(5vmin + 16px);padding:1.5em 0;}
.crs{--w:50%;--g:16px;display:flex;box-sizing:border-box;overflow-x:scroll;scroll-snap-type:x mandatory;}
.crs>*{flex-shrink:0;object-fit:contain;scroll-snap-align:center;width:var(--w);margin:0 var(--g);}
.crs::before,.crs::after{content:"";display:block;flex-shrink:0;width:calc(calc(50% - var(--g)) - calc(var(--w)/2));}
@media(max-width:560px){.crs{--w:100%;--g:0;}}
</style>
<canvas id="bg" width="256" height="256"></canvas>
<header>
	<a href="https://mcbeeringi.github.io/">McbeEringi</a>
	<nav>
		<input type="checkbox" id="hnavcb"><label for="hnavcb"></label><div>
			<a href="https://mcbeeringi.github.io/sky/">Sky</a>
			<a href="https://mcbeeringi.github.io/mc/">MC</a>
			<a href="https://mcbeeringi.github.io/apps/">Apps</a>
			<a class="lang"></a>
		</div></nav>
</header>`);
if(!localStorage.bg_star)localStorage.bg_star=JSON.stringify([0,0].map(x=>new Array(128).fill(0).map(Math.random)));
const palette=[
	[[0,'#00000c'],[0,'#00000c']],
	[[.85,'#020111'],[1,'#191621']],
	[[.6,'#020111'],[1,'#20202c']],
	[[.1,'#020111'],[1,'#3a3a52']],
	[[0,'#20202c'],[1,'#515175']],
	[[0,'#40405c'],[.8,'#6f71aa'],[1,'#8a76ab']],
	[[0,'#4a4969'],[.5,'#7072ab'],[1,'#cd82a0']],
	[[0,'#757abf'],[.6,'#8583be'],[1,'#eab0d1']],
	[[0,'#82addb'],[1,'#ebb2b1']],
	[[.01,'#94c5f8'],[.7,'#a6e6ff'],[1,'#b1b5ea']],
	[[0,'#b7eaff'],[1,'#94dfff']],
	[[0,'#9be2fe'],[1,'#67d1fb']],
	[[0,'#90dffe'],[1,'#38a3d1']],
	[[0,'#57c1eb'],[1,'#246fa8']],
	[[0,'#2d91c2'],[1,'#1e528e']],
	[[0,'#2473ab'],[.7,'#1e528e'],[1,'#5b7983']],
	[[0,'#1e528e'],[.5,'#265889'],[1,'#9da671']],
	[[0,'#1e528e'],[.5,'#728a7c'],[1,'#e9ce5d']],
	[[0,'#154277'],[.3,'#576e71'],[.7,'#e1c45e'],[1,'#b26339']],
	[[0,'#163c52'],[.3,'#4f4f47'],[.6,'#c5752d'],[.8,'#b7490f'],[1,'#2f1107']],
	[[0,'#071b26'],[.3,'#071b26'],[.8,'#8a3b12'],[1,'#240e03']],
	[[.3,'#010a10'],[.8,'#59230b'],[1,'#2f1107']],
	[[.5,'#090401'],[1,'#4b1d06']],
	[[.8,'#00000c'],[1,'#150800']],
],
rand=JSON.parse(localStorage.bg_star),
bgset=(t=new Date())=>{
	let bgctx=bg.getContext('2d'),h=t.getHours(),m=t.getMinutes(),hexm=('0'+Math.round(m*256/60).toString(16)).slice(-2),g;
	console.log(`${h}:${m}`);
	bgctx.beginPath();
	bgctx.rect(0,0,bg.width,bg.height);
	for(let i=0;i<2;i++){
		g=bgctx.createLinearGradient(1,0,1,bg.height);
		palette[(h+i)%24].forEach(x=>g.addColorStop(x[0],x[1]+(i?hexm:'')));
		bgctx.fillStyle=g;
		bgctx.fill();
	}
	m=(m+h*60)/1440;
	for(let i=1;i<=4;i++){
		bgctx.beginPath();
		bgctx.fillStyle='#fff'+['2','6','a','e'][i-1];
		for(let j=1;j<=32;j++)bgctx.rect(Math.floor((rand[0][i*j-1]+m)%1*bg.width),Math.floor((rand[1][i*j-1]-m+1)%1*bg.height),1,1);
		bgctx.fill();
	}
},
bgplay=(x=1000)=>{let t=Date.now();setInterval(()=>bgset(new Date(t+=100*x)),100);},
setstyle=()=>{
	bgset();setInterval(bgset,60000);
	document.body.insertAdjacentHTML('beforeend',`
<footer>
	© 2018~ @McbeEringi.｡:+*<br><br>
	<a href="https://twitter.com/mcbeeringi">Twitter</a>
	<a href="https://github.com/mcbeeringi">GitHub</a><br>
	<span contenteditable>press KeyZ…</span>
</footer>`);
	document.querySelectorAll('a.lang').forEach(e=>e.href='https://translate.google.com/translate?sl=ja&tl=en&u='+encodeURIComponent(location.href));
	document.querySelectorAll('a').forEach(e=>e.addEventListener('touchstart',()=>{},{passive:true}));
	document.addEventListener('keydown',e=>{if(e.code=='KeyZ')bgplay();},{once:true});
	document.documentElement.setAttribute('lang',window.navigator.language.slice(0,2));
};
if(document.readyState=='loading')window.addEventListener('DOMContentLoaded',setstyle,{once:true});else setstyle();
