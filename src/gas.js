(()=>{
	const d=document,n=navigator,ls=localStorage,ss=sessionStorage,id=()=>Math.random().toString(36).slice(2),send=x=>n.sendBeacon('https://script.google.com/macros/s/AKfycbxR1bd3vIjo3QHiyPaGmDs88j-n6T4zxPLmCI_Hsbjy15KZ1y7n-7pqLVpUGfv4WNyw/exec',JSON.stringify(x));
	send({lang:n.language,ref:d.referrer,loc:d.location.pathname+d.location.search});
	['error','unhandledrejection','rejectionhandled'].forEach(y=>addEventListener(y,e=>send({
		cid:ls.cid||(ls.cid=id()),t:Date.now(),loc:d.location.pathname+d.location.search,err:y+': '+(e.reason||e.message),
		mobile:+('ontouchend'in d),ua:n.userAgent,scr:[screen.width,screen.height],dpr:devicePixelRatio
	})));
})();