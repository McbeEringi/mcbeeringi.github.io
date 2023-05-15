//&cls&node %0
const wf=require('fs').promises.writeFile,p='https://codemirror.net/try/mods/';
console.log('CodeMirror Downloader\nSearching...');
(async _=>(_=(await(await fetch(p)).text()).match(/href=".*?\.js"/g),console.log(_.length+' files found.'),_.forEach(async x=>(
	x=decodeURIComponent(x.slice(6,-1)),
	wf(x,(await(await fetch(p+x)).blob()).stream()),console.log(x)
))))()