/*
	dconv.js
	(c)2021 McbeEringi MITLicense
	last modified 2021/4/17

	dconv={
		getDocStyle( e <HTMLElement>, cfg <Object>),
		toSvgStr( e <HTMLElement>, cfg <Object>),
		toSvgEl( e <HTMLElement>, cfg <Object>),
		toSvgBlob( e <HTMLElement>, cfg <Object>),
		toImgEl( e <HTMLElement>, cfg <Object>),
		toCanvas( e <HTMLElement>, cfg <Object>)
	};
	cfg={
		width:<Number> (optional),
		height:<Number> (optional),
		scale:<Number> (optional),
		canvas:<HTMLCanvasElement> (optional)
	};
*/
let dconv={};
(()=>{
	'use strict';
	dconv.getDocStyle=()=>Array.from(document.getElementsByTagName('style'),x=>x.outerHTML).join('');
	dconv.toSvgStr=(e,cfg={})=>{
		let tmp=window.getComputedStyle(e);
		if(!cfg.width)cfg.width=Number(tmp.width.slice(0,-2));
		if(!cfg.height)cfg.height=Number(tmp.height.slice(0,-2));
		if(!cfg.scale)cfg.scale=window.devicePicelRatio;
return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cfg.width*cfg.scale} ${cfg.height*cfg.scale}" width="${cfg.width*cfg.scale}" height="${cfg.height*cfg.scale}">
	${dconv.getDocStyle()}
	<foreignObject x="0" y="0" width="100%" height="100%">
		${e.outerHTML}
	</foreignObject>
</svg>`;
	};
	dconv.toSvgEl=(e,cfg)=>new DOMParser().parseFromString(dconv.toSvgStr(e,cfg),'image/svg+xml').childNodes[0];
	dconv.toSvgBlob=(e,cfg)=>new Blob([dconv.toSvgStr(e,cfg)],{type:'image/svg+xml'});
	dconv.toImgEl=(e,cfg)=>new Promise((res,rej)=>{
		let img=new Image();img.crossOrigin='Anonymous';
		img.onload=()=>{URL.revokeObjectURL(img.src);res(img);};img.onerror=rej;
		img.src=URL.createObjectURL(dconv.toSvgBlob(e,cfg));
	});
	dconv.toCanvas=(e,cfg={})=>new Promise((res,rej)=>{
		if(!cfg.canvas)cfg.canvas=document.createElement('canvas');
		dconv.toImgEl(e,cfg).then(img=>{cfg.canvas.getContext('2d').drawImage(img,0,0);res(cfg.canvas);}).catch(rej);
	});
})();
