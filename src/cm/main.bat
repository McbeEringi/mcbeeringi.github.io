//&cls&node %0&exit
/*
	CodeMirror https://github.com/codemirror/dev/blob/main/LICENSE
		Copyright (C) 2018 by Marijn Haverbeke <marijn@haverbeke.berlin>, AdrianHeine <mail@adrianheine.de>, and others
		Distributed under MITLicense
*/
const wf=require('fs').promises.writeFile,p='https://codemirror.net/try/mods/';
(async _=>(
	console.log('CodeMirror Downloader\nSearching...'),wf('index.html',_=await(await fetch(p)).text()),
	console.log(_.match(/href=".*?\.js"/g).map(async x=>(
		wf(x=decodeURIComponent(x.slice(6,-1)),(await(await fetch(p+x)).blob()).stream()),console.log(x)
	)).length+' files found.')
))()