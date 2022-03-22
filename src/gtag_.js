(x=>{
	const url='https://www.google-analytics.com/collect',d=document,n=navigator,ls=localStorage,tid=x;
	window.gtag_=x=>{//https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#events
		x=Object.entries(Object.assign(x,{v:1,tid,aip:1,ds:'web',cid:ls.cid||(ls.cid=Math.random().toString(36)),t:null,})).map(x=>x.map(encodeURIComponent).join('=')).join('&');
		if(n.sendBeacon)n.sendBeacon(url,x);else{const xhr=new XMLHttpRequest();xhr.open('POST',url,!0);xhr.send(x);}
	};
	gtag_({
		t:'pageview',
		dr:d.referrer,
		sr:screen.width+'x'+screen.height,vp:window.visualViewport?visualViewport.width+'x'+visualViewport.height:undefined,de:d.characterSet,sd:screen.colorDepth?screen.colorDepth+'-bits':void 0,ul:n.language.toLowerCase(),
		dl:d.location.origin+d.location.pathname+d.location.search,dt:d.title,
	});
})(tid);
//gtag_({t:'event',ea:'action',ec:'category',el:'label',ev:Number(value)})