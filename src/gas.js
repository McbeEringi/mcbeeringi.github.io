(()=>{
	const d=document,n=navigator,ls=localStorage,ss=sessionStorage,id=()=>Math.random().toString(36).slice(2),
		send=x=>n.sendBeacon('https://script.google.com/macros/s/AKfycbxR1bd3vIjo3QHiyPaGmDs88j-n6T4zxPLmCI_Hsbjy15KZ1y7n-7pqLVpUGfv4WNyw/exec',JSON.stringify(Object.assign({cid:ls.cid||(ls.cid=id()),sid:ss.sid||(ss.sid=id())},x)));
	send({ua:n.userAgent,scr:[screen.width,screen.height],dpr:devicePixelRatio,lang:n.language,t:Date.now(),touch:'ontouchend'in d,ref:d.referrer,loc:d.location.origin+d.location.pathname+d.location.search});
	['error','unhandledrejection','rejectionhandled'].forEach(y=>addEventListener(y,e=>send({err:y+': '+(e.reason||e).toString()})));
})();