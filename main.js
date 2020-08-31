document.write(`<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300&family=M+PLUS+Rounded+1c&display=swap" rel="stylesheet">
<link href="https://mcbeeringi.github.io/src/main.css" rel="stylesheet">`);
var header = document.createElement('header');
header.insertAdjacentHTML('beforeend',`
	<a href="https://mcbeeringi.github.io" class="left">
		<img src="https://mcbeeringi.github.io/img/6x6.png" width="32" height="32" alt="logo">
		<h3>McbeEringi</h3>
	</a>
	<nav>
		<div id="hnavd">
			<a href="https://mcbeeringi.github.io/esbe-2g">ESBE 2G</a>
			<a href="https://mcbeeringi.github.io/java-jajp">java ja_JP</a>
			<a href="https://mcbeeringi.github.io/sky">Sky</a>
			<a href="https://mcbeeringi.github.io/apps">Apps</a>
			<lang onClick="window.open('https://translate.google.com/translate?sl=ja&tl=en&u='+location.href)"></lang>
		</div>
		<input type="checkbox" id="hnavmcb"><div id="hnavm"></div><label id="hnavml" for="hnavmcb"></label>
	</nav>
`);
//header.setAttribute('id','H');
document.body.appendChild(header);
hnavm.insertAdjacentHTML('beforeend',hnavd.innerHTML);
var footer = document.createElement('footer');
footer.insertAdjacentHTML('beforeend',`
	<div class="text">
		<p>© 2018~ <a href="https://twitter.com/mcbeeringi">@McbeEringi</a>.｡:+*</p>
		<p>
			<a href="https://www.youtube.com/channel/UC7KFkUaWgpmdHViToV1wCAA">YouTube</a>
			<a href="https://github.com/mcbeeringi">GitHub</a>
		</p>
	</div>
`);
//footer.setAttribute('id','F');
window.onload=()=>document.body.appendChild(footer);
