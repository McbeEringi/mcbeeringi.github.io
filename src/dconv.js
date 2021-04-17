/*
	dconv.js
	(c)2021 McbeEringi MITLicense
	last modified 2021/4/17

	dconv={
		getStyle(),
		toSvgStr( elem <HTMLElement>, config <Object>),		>> "<svg xmlns="htt…"
		toSvgUrl( elem <HTMLElement>, config <Object>),		>> "data:image/svg+…"
		toImg( elem <HTMLElement>, config <Object>),		>> <img width="cfg.width*cfg.scale" height="cfg.height*cfg.scale" src="dconv.toSvgUrl()">
		toCanvas( elem <HTMLElement>, config <Object>)		>> <canvas width="cfg.width*cfg.scale" height="cfg.height*cfg.scale">
	};
	config={
		width:<Number> (optional default=window.getComputedStyle(elem).width),
		height:<Number> (optional default=window.getComputedStyle(elem).height),
		scale:<Number> (optional default=window.devicePixelRatio),
		canvas:<HTMLCanvasElement> (optional default=document.createElement('canvas'))
	};
*/
let dconv={};
(()=>{
	'use strict';
	dconv.getStyle=()=>Array.from(document.styleSheets,x=>Array.from(x.rules,y=>y.cssText).join('')).join('');
	dconv.cfgFb=(e,cfg)=>{
		let tmp=window.getComputedStyle(e);
		if(!cfg.width)cfg.width=Number(tmp.width.slice(0,-2));
		if(!cfg.height)cfg.height=Number(tmp.height.slice(0,-2));
		if(!cfg.scale)cfg.scale=window.devicePixelRatio;
		return cfg;
	};
	dconv.toSvgStr=(e,cfg={})=>{
		cfg=dconv.cfgFb(e,cfg);
return`<svg xmlns="http://www.w3.org/2000/svg" width="${cfg.width*cfg.scale}" height="${cfg.height*cfg.scale}">
	<foreignObject x="0" y="0" width="100%" height="100%">
		<html xmlns="http://www.w3.org/1999/xhtml" style="transform:scale(${cfg.scale});transform-origin:top left;">
		<style>pre,code{white-space:pre;}${dconv.getStyle()}</style>
		${e.outerHTML}
		</html>
	</foreignObject>
</svg>`;
	};
	dconv.toSvgUrl=(e,cfg)=>`data:image/svg+xml;charset=utf-8,${encodeURIComponent(dconv.toSvgStr(e,cfg))}`;
	dconv.toImg=(e,cfg)=>new Promise((res,rej)=>{
		cfg=dconv.cfgFb(e,cfg);let img=new Image();img.onload=()=>res(img);img.onerror=rej;
		[img.width,img.height]=[cfg.width*cfg.scale,cfg.height*cfg.scale];img.src=dconv.toSvgUrl(e,cfg);
	});
	dconv.toCanvas=(e,cfg={})=>new Promise((res,rej)=>{
		if(!cfg.canvas)cfg.canvas=document.createElement('canvas');
		dconv.toImg(e,cfg).then(img=>{
			[cfg.canvas.width,cfg.canvas.height]=[img.width,img.height];
			cfg.canvas.getContext('2d').drawImage(img,0,0);res(cfg.canvas);
		}).catch(rej);
	});
})();
