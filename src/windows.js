/*
 * made by @McbeEringi cc0
 * last modified 2020/8/26
 *
 * example : https://mcbeeringi.github.io/amuse/desktop.html
 */

document.write(`<style>
	div.window{position:relative;width:1920px;height:1080px;overflow:hidden;pointer-events:none;}
	div.window>div{pointer-events:auto;background-color:#fff;color:#000;border-radius:4px;box-shadow:0 0 8px #0008,0 0 2px #fff8 inset;filter:brightness(.7);position:absolute;overflow:hidden;min-width:128px;min-height:36px;}
	div.window>div:last-child{filter:none;}
	div.window.dark>div{background-color:#222;color:#fff;}div.window>div.transparent{background-color:#0000;}
	.hbar,.fbar{user-select:none;-webkit-user-select:none;text-align:center;touch-action:none;cursor:move;}
	.hbar{background:#6668;color:#fff;text-shadow:0 0 2px #444;font-size:16px;}
	.fbar>svg{position:absolute;bottom:0;right:0;width:16px;height:16px;cursor:nwse-resize;}
	.hbar.grab,.fbar.grab{background:#8888;}.pfixed>.hbar{background:#8668;cursor:default;}</style>`);

var wjs_pos=[{},{}];
window.addEventListener('load',()=>{
	var wtmp=[],wcr=[],tflag=false,custom_e=['hbar_pre','hbar_on','fbar_pre','fbar_on','bar_post','on_front'].map(x=>new Event(x));
	const pxnum=(x)=>Number(x.replace('px',''));
	//load data from cookie
	var cpair=decodeURIComponent(document.cookie).split(';'),carg={};
	for(var i=0;cpair[i];i++){var kv=cpair[i].split("=");carg[kv[0]]=kv[1];}
	if(carg.wjspos)wjs_pos[1]=JSON.parse(carg.wjspos);
	console.log('windows.js',wjs_pos[1]);

	document.body.querySelectorAll('div.window>div').forEach((e,i)=>{
		//cache default pos  //recover pos
		if(e.dataset.winid){
			wjs_pos[0][e.dataset.winid]=[e.style.top,e.style.left,e.style.width,e.style.height];
			if(wjs_pos[1][e.dataset.winid])[e.style.top,e.style.left,e.style.width,e.style.height]=wjs_pos[1][e.dataset.winid];
		}
		//header bar pre post
		var hbar=document.createElement('header');
		hbar.setAttribute('class','hbar');
		hbar.insertAdjacentHTML('beforeend',e.getAttribute('name'));
		if(!e.classList.contains('pfixed')){
			hbar.ontouchstart=(m)=>{
				tflag=true;hbar.classList.add('grab');
				wtmp[i]=[pxnum(window.getComputedStyle(e).left),m.changedTouches[0].clientX,pxnum(window.getComputedStyle(e).top),m.changedTouches[0].clientY];
				wcr=[e,i,wcr[2]];document.body.style.userSelect='none';document.body.style.WebkitUserSelect='none';e.dispatchEvent(custom_e[0]);
			}
			hbar.onmousedown=(m)=>{
				if(tflag)tflag=false;else{
					hbar.classList.add('grab');
					wtmp[i]=[pxnum(window.getComputedStyle(e).left),m.clientX,pxnum(window.getComputedStyle(e).top),m.clientY];
					wcr=[e,i,wcr[2]];document.body.style.userSelect='none';document.body.style.WebkitUserSelect='none';e.dispatchEvent(custom_e[0]);
				}
			}
		}
		e.insertBefore(hbar,e.firstChild);
		//footer bar pre post
		var fbar=document.createElement('footer');
		fbar.setAttribute('class','fbar');
		if(!e.classList.contains('sfixed')){
			fbar.insertAdjacentHTML('beforeend','<svg><polygon points="0,0 0,16 16,16 16,0"fill="#6668"></polygon><polygon points="0,16 16,16 16,0"fill="#8888"></polygon></svg>');
			fbar.ontouchstart=(m)=>{
				tflag=true;fbar.classList.add('grab');
				wtmp[i]=[pxnum(window.getComputedStyle(e).width),m.changedTouches[0].clientX,pxnum(window.getComputedStyle(e).height),m.changedTouches[0].clientY];
				wcr=[e,i,wcr[2]];document.body.style.userSelect='none';document.body.style.WebkitUserSelect='none';e.dispatchEvent(custom_e[2]);
			}
			fbar.onmousedown=(m)=>{
				if(tflag)tflag=false;else{
					fbar.classList.add('grab');
					wtmp[i]=[pxnum(window.getComputedStyle(e).width),m.clientX,pxnum(window.getComputedStyle(e).height),m.clientY];
					wcr=[e,i,wcr[2]];document.body.style.userSelect='none';document.body.style.WebkitUserSelect='none';e.dispatchEvent(custom_e[2]);
				}
			}
		}
		e.appendChild(fbar);
		//front controll
		e.ontouchstart=()=>{if(wcr[2]!=i){wcr[2]=i;e.parentNode.appendChild(e);e.dispatchEvent(custom_e[5]);}}
		e.onmousedown=()=>{if(wcr[2]!=i){wcr[2]=i;e.parentNode.appendChild(e);e.dispatchEvent(custom_e[5]);}}
	});//console.log(wjs_pos);
	const onpost=()=>{if(wcr[0]){wcr[0].firstChild.classList.remove('grab');wcr[0].lastChild.classList.remove('grab');wcr[0].dispatchEvent(custom_e[4]);
		if(wcr[0].dataset.winid)wjs_pos[1][wcr[0].dataset.winid]=[wcr[0].style.top,wcr[0].style.left,wcr[0].style.width,wcr[0].style.height];wcr[0]=null;wjs_save();}
		document.body.style.userSelect='auto';document.body.style.WebkitUserSelect='auto';}
	window.ontouchend=()=>onpost();window.ontouchcancel=()=>onpost();window.onmouseup=()=>onpost();
	window.ontouchmove=(e)=>{
		if(wcr[0]){
			var winst=window.getComputedStyle(wcr[0].parentNode);
			if(wcr[0].firstChild.classList.contains('grab')){//move
				e.preventDefault();wcr[0].dispatchEvent(custom_e[1]);
				wcr[0].style.left=Math.min(Math.max(wtmp[wcr[1]][0]+e.changedTouches[0].clientX-wtmp[wcr[1]][1],-pxnum(window.getComputedStyle(wcr[0]).width)+16),pxnum(winst.width)-16)+'px';
				wcr[0].style.top=Math.min(Math.max(wtmp[wcr[1]][2]+e.changedTouches[0].clientY-wtmp[wcr[1]][3],0),pxnum(winst.height)-pxnum(window.getComputedStyle(wcr[0].firstChild).height))+'px';
			}else if(wcr[0].lastChild.classList.contains('grab')){//resize
				e.preventDefault();wcr[0].dispatchEvent(custom_e[3]);
				wcr[0].style.width=wtmp[wcr[1]][0]+e.changedTouches[0].clientX-wtmp[wcr[1]][1]+'px';
				wcr[0].style.height=wtmp[wcr[1]][2]+e.changedTouches[0].clientY-wtmp[wcr[1]][3]+'px';
			}
		}
	}
	window.onmousemove=(e)=>{
		if(wcr[0]){
			var winst=window.getComputedStyle(wcr[0].parentNode);
			if(wcr[0].firstChild.classList.contains('grab')){//move
				wcr[0].dispatchEvent(custom_e[1]);
				wcr[0].style.left=Math.min(Math.max(wtmp[wcr[1]][0]+e.clientX-wtmp[wcr[1]][1],-pxnum(window.getComputedStyle(wcr[0]).width)+16),pxnum(winst.width)-16)+'px';
				wcr[0].style.top=Math.min(Math.max(wtmp[wcr[1]][2]+e.clientY-wtmp[wcr[1]][3],0),pxnum(winst.height)-pxnum(window.getComputedStyle(wcr[0].firstChild).height))+'px';
			}else if(wcr[0].lastChild.classList.contains('grab')){//resize
				wcr[0].dispatchEvent(custom_e[3]);
				wcr[0].style.width=wtmp[wcr[1]][0]+e.clientX-wtmp[wcr[1]][1]+'px';
				wcr[0].style.height=wtmp[wcr[1]][2]+e.clientY-wtmp[wcr[1]][3]+'px';
			}
		}
	}
	document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='hidden')wjs_save();})
	document.addEventListener('beforeunload',()=>{wjs_save();})
},false);
function wjs_save(){document.cookie=`wjspos=${encodeURIComponent(JSON.stringify(wjs_pos[1]))};max-age=604800;path=${location.pathname}`;return 'saved'}
function wjs_reset(){
	document.body.querySelectorAll('div.window>div').forEach((e,i)=>{if(e.dataset.winid)[e.style.top,e.style.left,e.style.width,e.style.height]=wjs_pos[0][e.dataset.winid];});
	wjs_pos[1]={};wjs_save();
}
