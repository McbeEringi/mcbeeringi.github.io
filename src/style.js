var header = document.createElement('header');
header.insertAdjacentHTML('beforeend',`
	<a href="https://mcbeeringi.github.io">McbeEringi</a>
	<nav>
		<div id="hnavd">
			<a href="https://mcbeeringi.github.io/esbe-2g">ESBE 2G</a>
			<a href="https://mcbeeringi.github.io/java-jajp">java ja_JP</a>
			<a href="https://mcbeeringi.github.io/sky">Sky</a>
			<a href="https://mcbeeringi.github.io/apps">Apps</a>
			<a href=""><script>document.currentScript.parentElement.href='https://translate.google.com/translate?sl=ja&tl=en&u='+location.href;</script><lang></lang></a>
		</div>
		<input type="checkbox" id="hnavmcb"><div id="hnavm"></div><label id="hnavml" for="hnavmcb"></label>
	</nav>
`);
document.body.insertBefore(header,document.body.firstChild);
hnavm.insertAdjacentHTML('beforeend',hnavd.innerHTML);
const setstyle=()=>{
	var footer = document.createElement('footer');
	footer.insertAdjacentHTML('beforeend',`
		© 2018~ @McbeEringi.｡:+*<br><br>
		<a href="https://twitter.com/mcbeeringi">Twitter</a>
		<a href="https://www.youtube.com/channel/UC7KFkUaWgpmdHViToV1wCAA">YouTube</a>
		<a href="https://github.com/mcbeeringi">GitHub</a>
	`);
	document.body.appendChild(footer);
	document.querySelectorAll('a').forEach(e=>{if(e.ontouchstart==undefined)e.ontouchstart=()=
	document.querySelectorAll('.stuff img,.pad img').forEach(e=>e.width="512px");
};
if(document.readyState=='loading')window.addEventListener('DOMContentLoaded',setstyle);else setstyle();
document.body.insertAdjacentHTML('afterbegin',`<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300&family=M+PLUS+Rounded+1c&display=swap" rel="stylesheet">
<style></style>
<link href="https://mcbeeringi.github.io/src/style.css" rel="stylesheet">
`);
