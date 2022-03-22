(x=>{
	const url='https://www.google-analytics.com/collect',d=document,n=navigator,ls=localStorage,tid=x;
	window.gtag_=y=>{//https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#events
		y=Object.entries(Object.assign({
			v:1,tid,aip:1,ds:'web',cid:ls.cid||(ls.cid=Math.random().toString(36)),z:Date.now(),
			dr:d.referrer||void 0,
			sr:screen.width+'x'+screen.height,vp:window.visualViewport?visualViewport.width+'x'+visualViewport.height:undefined,de:d.characterSet,sd:screen.colorDepth?screen.colorDepth+'-bits':void 0,ul:n.language.toLowerCase(),
			dl:d.location.origin+d.location.pathname+d.location.search,dt:d.title
		},y)).filter(z=>z[1]!=void 0).map(x=>x.map(encodeURIComponent).join('=')).join('&');
		if(n.sendBeacon)n.sendBeacon(url,y);else{const xhr=new XMLHttpRequest();xhr.open('POST',url,!0);xhr.send(y);}
	};
	gtag_({t:'pageview'});
	['error','unhandledrejection','rejectionhandled'].forEach((y,i)=>addEventListener(y,e=>gtag_({t:'exception',exd:(e.reason||e).toString(),exf:+(i<2)})));
})(tid);
//gtag_({t:'event',ea:'action',ec:'category',el:'label',ev:Number(value)})