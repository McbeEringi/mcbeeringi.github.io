'use strict';
let main,calced,tims={};
const ctx=c.getContext('2d'),res=window.devicePixelRatio||1,cfg={pad:12,w:16},
n2i={'-9':'0','-8':'0.5','-7':'1','-6':'1.5','-5':'2','-4':'3','-3':'3.5','-2':'4','-1':'4.5','0':'5','1':'5.5','2':'6','3':'7','4':'7.5','5':'8','6':'8.5','7':'9','8':'10','9':'10.5','10':'11','11':'11.5','12':'12','13':'12.5','14':'13','15':'14'},
frr=(ct,col,x,y,dx,dy,rl=0,rr=rl)=>{
	ct.fillStyle=col;
	ct.beginPath();
	ct.moveTo(x,y+rl);ct.arc(x+rl,y+rl,rl,Math.PI,Math.PI*1.5);
	ct.lineTo(x+dx-rr,y);ct.arc(x+dx-rr,y+rr,rr,Math.PI*1.5,0);
	ct.lineTo(x+dx,y+dy-rr);ct.arc(x+dx-rr,y+dy-rr,rr,0,Math.PI*.5);
	ct.lineTo(x+rl,y+dy);ct.arc(x+rl,y+dy-rl,rl,Math.PI*.5,Math.PI);
	ct.fill();
},
calc=()=>{
	calced={box:[],note:[]};
	let pos=0,
	core=(x,l=1,p=0,ind=[])=>{
		let odl=1/l;
		x.forEach((y,i)=>{
			if(typeof y=='object'){
				let tmp=pos;
				pos+=cfg.pad+1;
				core(y,l*y.length,p,[...ind,i]);
				pos+=cfg.pad;
				calced.box.push({pos:tmp,ind:[...ind,i],dx:pos-tmp});
			}
			else{
				calced.note.push({pos,ind:[...ind,i],p});
				pos+=cfg.w;
			}
			pos+=1;
			p+=l;
		});
	};
	core(main.scores);
	scrw.style.width=(calced.length=pos-1)+'px';
},
draw=()=>{
	if(!calced)return;
	let w=c.parentNode.clientWidth,pos=w*.5-scr.scrollLeft,ins;
	ctx.clearRect(0,0,w,240);
	for(let x of calced.box){
		if(x.pos+x.dx+pos<0)continue;if(w<x.pos+pos)break;
		frr(ctx,'#4444',x.pos+pos,0,x.dx,240,4);
		let cur;
		if(Math.abs(cur=x.pos-scr.scrollLeft+cfg.pad2)<=cfg.pad2){
			cur=cur>0;
			ins=[x.pos+pos+(cur?-2:cfg.pad-1),0];
		}else if(Math.abs(cur=x.pos-scr.scrollLeft+x.dx-cfg.pad2)<=cfg.pad2){
			cur=cur>0;
			ins=[x.pos+x.dx+pos+(cur?-cfg.pad-2:-1),0];
		}
	}
	for(let x of calced.note){
		if(x.pos+cfg.w+pos<0)continue;if(w<x.pos+pos)break;
		let cur=Math.abs(x.pos-scr.scrollLeft+cfg.w2)<=cfg.w2;
		frr(ctx,cur?'#aef8':'#0004',x.pos+pos,0,cfg.w,240,4);
		if(cur){
			cur=x.pos-scr.scrollLeft+cfg.w2>0;
			ins=[x.pos+pos+(cur?-2:cfg.w-1),0];
		}
		let note=x.ind.reduce((a,y)=>a[y],main.scores);
		if(note)
			note.split(',').forEach(n=>{
				let col='#fea';
				if(n2i[n]==undefined){
					n=Number(n);col='#fea8';
					if(n>0)n=(n+9)%24-9;else n=(n+10)%24+14;
				}
				frr(ctx,col,x.pos+1+pos,225-Number(n2i[String(n)])*16,cfg.w-2,14,4);//240-16+1
			});
	}
	if(ins)frr(ctx,'#feac',ins[0],0,3,240);
},
init=()=>{
	calc();
	draw();
};
scr.addEventListener('scroll',draw,{passive:true})//()=>{if(!tims.scr)tims.scr=setTimeout(()=>{draw();tims.scr=0;},20);}
{
	(window.onresize=()=>{
		c.width=res*c.parentNode.clientWidth;
		c.height=res*240;
		ctx.scale(res,res);
		draw();
	})();
	cfg.pad2=cfg.pad/2;
	cfg.w2=cfg.w/2;

	main={
		scores:[
			["9,-5","11,-5"],["5,-3","6","-3","2"],[["5,-6","4"],"2,-6"],["2,-1","4,-1"],
			["5,-8",["5,-8","4"]],["2,-3","4","6,-3","9"],["11,-10","5","6,-10","2"],["5,-10","2,-7","4,-8","2,-10"],
			["6,-5","9,-5"],["11,-3","5","6,-3","2"],["6,-6","2","5,-6","6"],["5,-1","4","2,-1","4"],
			["5,-8",["2,-8","4"]],["5,-3","9","5,-3","6"],[["5,-10","2"],"4,-10"],["2,-10","-8","4,-7","-6"],

			["9,-5","11,-5"],["5,-3","6","-3","2"],[["5,-6","4"],"2,-6"],["2,-1","4,-1"],
			["5,-8",["5,-8","4"]],["2,-3","4","6,-3","9"],["11,-10","5","6,-10","2"],["5,-10","2,-7","4,-8","2,-10"],
			["6,-5","9,-5"],["11,-3","5","6,-3","2"],["6,-6","2","5,-6","6"],["5,-1","4","2,-1","4"],
			["5,-8",["2,-8","4"]],["5,-3","9","5,-3","6"],[["5,-10","2"],"4,-10"],["2,-10","-8","2,-7","-6"],

			["2,-5",["-3,-5","-1"]],["2,-3",["-3","-1"]],["2,-6","4","6,-6","2"],["7,-1","6","7,-1","9"],
			["2,-8","2,-8"],["-3","-1","2,-3","-3"],["7,-10","6","4,-10","2"],["-3,-10","-6,-7","-5,-8","-3,-10"],
			["2,-5",["-3,-5","-1"]],["2,-3",["-3","-1"]],["2,-6","2","4,-6","6"],["2,-1","-3","-1","-3"],
			["2,-8",["2,-8","1"]],["2,-3","-3","-1,-3","2"],["7,-10","6","7,-10","9"],["2,-10","-8","1,-7","-6"],

			["2,-5",["-3,-5","-1"]],["2,-3",["-3","-1"]],["2,-6","4","6,-6","2"],["7,-1","6","7,-1","9"],
			["2,-8","2,-8"],["-3","-1","2,-3","-3"],["7,-10","6","4,-10","2"],["-3,-10","-6,-7","-5,-8","-3,-10"],
			["2,-5",["-3,-5","-1"]],["2,-3",["-3","-1"]],["2,-6","2","4,-6","6"],["2,-1","-3","-1","-3"],
			["2,-8",["2,-8","1"]],["2,-3","-3","-1,-3","2"],["7,-10","6","7,-10","9"],["2,-10","-8","4,-7","-6"]
		],
		sc:-2,
		bpm:120
	};

	init();
}
