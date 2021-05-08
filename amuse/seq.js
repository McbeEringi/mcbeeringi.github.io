'use strict';
let main={},calced,timer={},scrolling=false,urstack;
const ctx=c.getContext('2d'),res=window.devicePixelRatio||1,
frr=(ct,col,x,y,dx,dy,rl=0,rr=rl)=>{
	ct.fillStyle=col;
	ct.beginPath();
	ct.moveTo(x,y+rl);ct.arc(x+rl,y+rl,rl,Math.PI,Math.PI*1.5);
	ct.lineTo(x+dx-rr,y);ct.arc(x+dx-rr,y+rr,rr,Math.PI*1.5,0);
	ct.lineTo(x+dx,y+dy-rr);ct.arc(x+dx-rr,y+dy-rr,rr,0,Math.PI*.5);
	ct.lineTo(x+rl,y+dy);ct.arc(x+rl,y+dy-rl,rl,Math.PI*.5,Math.PI);
	ct.fill();
},
a2c=(b)=>{
	let pos=-scr.scrollLeft,note=[];
	const w=c.parentNode.clientWidth,
	pad=256,
	calc=calced.scr==undefined||Math.abs(calced.scr-scr.scrollLeft)>pad||b,
	core=(y,p=0,l=1,ind=[])=>{
		let odl=1/l;
		for(let[yi,z]of y.entries()){
			if(typeof z=='object'){
				let tmp=pos;pos+=13;
				core(z,p,l*z.length,[...ind,yi]);pos+=12;
				if(0<pos&&tmp<w)frr(ctx,'#4444',tmp,0,pos-tmp,240,4);
				pos+=1;
			}else{
				if(-15<pos&&pos<w){
					frr(ctx,'#0004',pos,0,16,240,4,4);
					if(z)z.split(',').forEach(n=>{
						let tmp=false;
						if(n2i[n]==undefined){
							if(Number(n)>0)n=String((Number(n)+9)%24-9);
							else n=String((Number(n)+10)%24+14);
							tmp=true;
						}
						note.push([tmp,pos+1,225-Number(n2i[n])*16]);//240-16+1
					});
				}
				if(-pad<pos&&pos<w+pad){
					if(calc)calced.dat.push({ind:[...ind,yi],p:p,pos:pos+scr.scrollLeft});
					ctx.fillText(p.toFixed(2),pos,16,16);ctx.fillText([...ind,yi],pos,32,16);
				}
				pos+=17;
			}
			if(pos>w+pad&&!b)break;
			p+=odl;
		}
	};
	ctx.clearRect(0,0,w,240);
	pos+=16;
	if(calc){calced.scr=scr.scrollLeft;calced.dat=[];}
	core(main.scores);pos+=w*.5;
	note.forEach(y=>frr(ctx,y[0]?'#fea8':'#fea',y[1],y[2],14,14,4));
	if(calc){console.log(calced);let tmp=curset();if(tmp)kbset(ind2n(tmp.ind));else kbset();}
	return pos+scr.scrollLeft;
},
i2n=['-9','-7','-5','-4','-2','0','2','3','5','7','8','10','12','14','15'],
n2i={'-9':'0','-8':'0.5','-7':'1','-6':'1.5','-5':'2','-4':'3','-3':'3.5','-2':'4','-1':'4.5','0':'5','1':'5.5','2':'6','3':'7','4':'7.5','5':'8','6':'8.5','7':'9','8':'10','9':'10.5','10':'11','11':'11.5','12':'12','13':'12.5','14':'13','15':'14'},
pos2p=pos_=>{let tmp=pos_.split(':').map(x=>Number(x));return tmp[0]*Tone.Transport.timeSignature+tmp[1]+tmp[2]*.25;},
p2pos=p_=>`${Math.floor(p_/Tone.Transport.timeSignature)}:${Math.floor(p_)%Tone.Transport.timeSignature}:${(p_*4)%4}`,
n2Hz=x=>440*Math.pow(2,(Number(x)+main.sc)/12)*2,//C4~C6
ind2n=x=>x.reduce((a,y)=>a[y],main.scores),
tstat=()=>Tone.Transport.state!='started',
curstat=x=>!x||scr.scrollLeft-16>x.pos||x.pos>scr.scrollLeft+scr.clientWidth,
ms2se=()=>{clearTimeout(timer.main2seq);timer.main2seq=setTimeout(()=>requestIdleCallback(()=>{seq.events=main.scores;console.log('scores updated')}),300);},
stdli=(a,b=a+1,s={})=>{for(let i=a;i<=b;i++){s[`d#${i}`]=`ds${i}.mp3`;s[`a${i}`]=`a${i}.mp3`;}return s;},
synth=new Tone.Sampler(stdli(4,6,{'a3':'a3.mp3','d#7':'ds7.mp3'}),()=>{},'https://mcbeeringi.github.io/sky/audio/instr/musicbox/').toDestination(),
sytar=(n,t)=>{
	n=n.split(',');
	if(n[0]){
		synth.triggerAttackRelease(n.map(n2Hz),'1m',t,1);
	}
},
seq=new Tone.Sequence((time,note)=>{
	curset();
	scrset();
	kbset(note);
	sytar(note,time);
},[],'4n').start(0),
curset=p=>{
	let tmp;
	if(!p){
		tmp=pos2p(Tone.Transport.position)%main.scores.length;
		p=calced.dat.slice().reverse().find(x=>Math.abs(x.p-tmp)<1&&tmp>=x.p);
	}
	if(p){
		console.log(p);
		dispCur.style.display='';
		dispCur.style.left=`${p.pos}px`;
	}else{
		tmp=calced.dat[Math.round((calced.dat.length-1)*.5)].p-tmp;
		dispinfo.textContent=tmp>0?`← ${tmp.toFixed(1)}`:`${-tmp.toFixed(1)} →`;
		clearTimeout(timer.dispinfo);
		timer.dispinfo=setTimeout(()=>dispinfo.textContent='',1000);
		dispCur.style.display='none';
	}
	return p;
},
curpset=x=>{
	if(x==undefined)return;
	curset(x);Tone.Transport.position=p2pos(x.p);
	if(tstat())sytar(ind2n(x.ind));
},
scrset=()=>{
	if(dispCur.style.display=='none'||scrolling)return;
	let tmp=Number(dispCur.style.left.slice(0,-2)),pad=48;
	switch((tmp<scr.scrollLeft-16+pad)+(tmp<scr.scrollLeft+scr.clientWidth-pad)){
		case 0:scr.scrollLeft=tmp-pad;break;
		case 2:scr.scrollLeft=tmp-scr.clientWidth+16+pad;break;
	}
},
kbset=(x='')=>{
	let tmp=x.split(',');
	[...kb.children].forEach((y,i)=>y.classList[tmp.includes(i2n[i])?'add':'remove']('a'));
},
tstep=x=>{
	let tmp=dispCur.style.left.slice(0,-2)||16;
	tmp=calced.dat.findIndex(y=>tmp==y.pos);
	if(tmp<0)return 0;tmp=calced.dat[tmp+x];
	/*
	let tmp=pos2p(Tone.Transport.position)%main.scores.length;
	tmp=calced.dat.slice().reverse().findIndex(y=>Math.abs(y.p-tmp)<1&&tmp>=y.p);
	if(tmp<0)return 0;tmp=calced.dat[calced.dat.length-1-tmp+x];
	*/
	if(curstat(tmp))return 0;
	Tone.Transport.pause();dtrs.checked=false;
	curpset(tmp);scrset();
	kbset(tmp.ind.reduce((a,x)=>a[x],main.scores));
	return 1;
},
urset=x=>{urstack[2]=[];urstack[0].push(urstack[1]);urstack[1]=x;while(urstack[0].length>Number(localStorage.seq_urMax))urstack[0].shift();console.log(x);undobtn.disabled=false;redobtn.disabled=true;},
urdo=x=>{
	let tmp=false;
	while(x<0){if(urstack[0].length){urstack[2].unshift(urstack[1]);urstack[1]=urstack[0].pop();x++;tmp=true;console.log('undo');Function(urstack[1][0]+urstack[1][2])();}else{break;}}
	while(0<x){if(urstack[2].length){urstack[0].push(urstack[1]);urstack[1]=urstack[2].shift();x--;tmp=true;console.log('redo');Function(urstack[1][0]+urstack[1][1])();}else{break;}}
	undobtn.disabled=!urstack[0].length;redobtn.disabled=!urstack[2].length;
	if(tmp){
		a2c(1);
		ms2se();
	}
},
init=()=>{
	seq.events=main.scores;
	if(main.sc==undefined)main.sc=0;
	Tone.Transport.bpm.value=main.bpm;
	urstack=[[],['main.scores=',null,JSON.stringify(main.scores)],[]];
	redobtn.disabled=undobtn.disabled=true;
	calced={};
	scrw.style.width=a2c(1)+'px';
	stopbtn.onclick();
};

scr.onclick=e=>{
	Tone.start();
	let cp=e.clientX+window.scrollX+scr.scrollLeft,
	np=calced.dat.find(x=>x.pos<=cp&&cp<Number(x.pos)+16);
	console.log({cursor:cp,fixed:np});
	curpset(np);
	if(np)kbset(np.ind.reduce((a,x)=>a[x],main.scores));
};
playbtn.onclick=e=>{
	Tone.start();
	let stat=tstat();
	Tone.Transport[stat?'start':'pause']();
	dtrs.checked=stat;
};
stopbtn.onclick=e=>{
	Tone.Transport.stop();scr.scrollLeft=0;curset();kbset([main.scores[0]].flat()[0]);
	dtrs.checked=false;
};
undobtn.onclick=()=>urdo(-1);
redobtn.onclick=()=>urdo(1);
[...kb.children].forEach((x,i)=>{
	const keyfx=e=>{
		e.preventDefault();
		let tmp=pos2p(Tone.Transport.position)%main.scores.length;
		tmp=calced.dat.slice().reverse().find(x=>Math.abs(x.p-tmp)<1&&tmp>=x.p);
		if(tstat()&&!curstat(tmp)){
			let arr=ind2n(tmp.ind).split(',').filter(y=>y);
			if(x.classList.toggle('a')){
				Tone.start();
				synth.triggerAttackRelease(n2Hz(i2n[i]));
				arr=arr.concat(i2n[i]);
			}else{
				arr=arr.filter(y=>y!=i2n[i]);
			}
			let cmd=[`main.scores[${tmp.ind.join('][')}]=`,`'${arr.join(',')}'`];
			Function(cmd[0]+cmd[1])();urset(cmd.concat(`'${ind2n(tmp.ind)}'`));
			ms2se();a2c();
		}else synth.triggerAttackRelease(n2Hz(i2n[i]));
	}
	x.addEventListener('touchstart',keyfx);
	x.addEventListener('mousedown',keyfx);
});
document.onkeydown=e=>{
	if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
	switch(e.code){
		case'Space':e.preventDefault();playbtn.onclick();break;
		case'ArrowLeft':Tone.start();if(tstep(e.shiftKey?-8:-1))e.preventDefault();break;
		case'ArrowRight':Tone.start();if(tstep(e.shiftKey?8:1))e.preventDefault();break;
		default:
			const keymap=Array.from('QWERTASDFGZXCVB',x=>`Key${x}`);
			if(keymap.includes(e.code)&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey){
				kb.children[keymap.indexOf(e.code)].dispatchEvent(new Event('mousedown'));
			}
	}
};
{
	ctx.imageSmoothingEnabled=false;localStorage.seq_urMax=128;
	window.onresize=()=>{c.width=c.parentNode.clientWidth*res;c.height=240*res;ctx.scale(res,res);a2c();};
	const tmp=()=>{scrolling=true;clearTimeout(timer.scrilling);timer.scrilling=setTimeout(()=>scrolling=false,500);};
	scr.addEventListener('wheel',e=>{e.preventDefault();scr.scrollLeft+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.shiftKey?.1:1);tmp();});
	scr.addEventListener('pointermove',tmp,{passive:true});
	scr.addEventListener('scroll',()=>a2c(),{passive:true});
}
main.scores=["-4","",["-4","-4"],["-4","-4"],["-9,-4,3","","-4,-2","-2"],["-7,-2,5","","3,-2","5"],["-5,0,7","","0,10","10"],["-5,-2,12","","-2,7","5"],["-9,-4,3","3","-4,7","7"],["-7,-2,5","3","-2,3","5"],["-5,0,7","","0,10",""],["-5,-2,7","","-2",""],["-9,-4,3","","-4,-2",""],["-7,-2,5","","-2,3","5"],["0,-5,7","","0,10",""],["-5,-2,7","","-2,5",""],["-9,-4,3","","-4,7",""],["-7,-2,5","","-2,7",""],["-9,-5,3","","-5,-2",""],["-9,-5","","7","10"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-9,-5,3","","-5,-2",""],["-9,-5,3","","3,5","3,10,7"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,14,10",""],["-5,-2,15,10,3","","-2,3,7","5"],["-9,-4,0","","7,3,-4",""],["-7,-2,2,5,10","","-2,7,3","5"],["-9,-5,3","","-5,-2",""],["-9,-5,0","","-2",""],["-9,-4","7,3"],["","-4","7,3",""],["5,-7,-2,2","","3","-2"],["2","","5,2,-2",""],["3,-5,0","","","0"],["","-2"],["-2,-5","-4"],["-5","-5"],["-9,-4","7,3"],["7,3","-4","7,3",""],["5,-7,-2,2","3"],["2","-2,-7"],["-2,-5,0","7,3"],["5","3,-5,0"],["7,2,-2,5,-5",""],["5,-2,2,-5","3"],["-9,-4","-2"],["7,-9,-4,3","10,7,3"],["-7,-2","7,3"],["2,-2,-7","3"],["-5,0","-2"],["7,3,-5,0","10,7,3"],["-5,-2","7,3"],["2,-5,-2","5"],["3,-9,-4","","","-4"],["","-2,-4"],["3,-4,-9",""],["-4","3"],["5,-7,-2,2","3"],["8,-7,-2,5","8,5"],["7,3","-4,-7"],["2","2,-7,-5"],["3,-5,0","3"],["3","-2,-5,0"],["5,-9,-4,2",""],["3,-4","3"],["5,-7,-2,2","3"],["3","8,-7,-2,5"],["7,-2,-9,3",""],["7,-5,2,5","5","3","2"],["3,-5,0","","","0"],["3","7,-5,0,3"],["10,-4,-9,7,3","3"],["3","3,-4,-9"],["5,-7,2,-2","7,3"],["5,2,-7,-2","3"],["3,-2,-9",""],["2","2,-5,-7"],["3,-5,0","3"],["3","-2,-5,0"],["5,-9,-4,2",""],["3,-4","3"],["5,-7,-2,2","3"],["3","8,-7,-2,5"],["7,-2,-9,3",""],["7,-5,2,5","5","3","2"],["3,-5,0","","","0"],["3","7,-5,0,3"],["-5,-2,8,5","7,3"],["-5,-2,5","3"],["-9,-4,5,3",""],["-9,-4","-2"],["-4,-9,-2","-2"],["-4,-9,7,3","5,3"],["-7,-2,5,2",""],["3","-7,2,-2"],["-7,2,-4",""],["-5,-7,7,3","3"],["-9,-4,3","","-4,-2","-2"],["-7,-2,5,2","","3,-2","5"],["-5,0,7,3","","0,10,7,3","10,7,3"],["-5,-2,12,7,3","","-2,7,3","5"],["-9,-4,3","3","-4,7,3","7,3"],["-7,-2,5,2","3","-2,3","5,2"],["-5,0,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2",""],["-9,-4,3","","-4,-2",""],["-7,-2,5,2","","-2,3","5"],["0,-5,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2,5,3","3"],["-9,-4,3","","-4,7,3",""],["-7,-2,5,2","","-2,7,5,2",""],["-9,-5,3","","-5,-2",""],["-9,-5","","0","2"],["-9,-4,3","","-4,-2","-2"],["-7,-2,5,2","","3,-2","5"],["-5,0,7,3","","0,10,7,3","10,7,3"],["-5,-2,12,7,3","","-2,7,3","5"],["-9,-4,3","3","-4,7,3","7,3"],["-7,-2,5,2","3","-2,3","5,2"],["-5,0,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2",""],["-9,-4,3","","-4,-2",""],["-7,-2,5,2","","-2,3","5"],["0,-5,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2,5,3",""],["-9,-4,3","","-4,7,3",""],["-7,-2,5,2","","-2,7,5,2",""],["-9,-5,3","","-5,-2",""],["-9,-5","","7,3","7,3,10"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-9,-5,3","","-5,-2",""],["-9,-5,3","","3,5","3,10,7"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,14,10",""],["-5,-2,15,10,3","","-2,3,7","5"],["-9,-4,0","","7,3,-4",""],["-7,-2,2,5,10","","-2,7,3","5"],["-9,-5,3","","-5,-2",""],["-5,-9",""],"","","",""];
main.sc=-2;
main.bpm=120;
init();window.onresize();log.textContent='build: 2105090';

if(window.navigator.userAgent.includes('Safari'))
requestIdleCallback(()=>
	//fetch('img/seq.svg').then(x=>x.text()).then(x=>
	{
		let img=new Image();
		img.onload=()=>{
			let c=document.createElement('canvas'),
				ctx=c.getContext('2d');
			ctx.imageSmoothingEnabled=false;
			c.width=img.naturalWidth;c.height=img.naturalHeight;
			ctx.drawImage(img,0,0);
			document.body.insertAdjacentHTML('beforeend',`<style>#kb>p::after,.bg{background-image:url(${c.toDataURL()});}</style>`);
			//c.toBlob(b=>document.body.insertAdjacentHTML('beforeend',`<style>#kb>p::after,.bg{background-image:url(${URL.createObjectURL(b)});}</style>`);
		};
		img.src='img/seq.svg';//`data:image/svg+xml;base64,${btoa(unescape(encodeURI(x)))}`;
	}//)
);
