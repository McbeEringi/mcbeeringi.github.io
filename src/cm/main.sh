node --input-type=module<<JS
import{writeFile as wf}from'fs/promises';
const p='https://codemirror.net/try/mods/';
(async _=>(
	console.log('CodeMirror Downloader\nSearching...'),wf('cm-index.html',_=await(await fetch(p)).text()),
	console.log(_.match(/href=".*?\.js"/g).map(async x=>(
		wf(x=decodeURIComponent(x.slice(6,-1)),await(await fetch(p+x)).blob()).stream(),console.log(x)
	)).length+' files found.')
))();
JS