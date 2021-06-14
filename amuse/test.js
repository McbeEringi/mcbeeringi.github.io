let main,calced;
const ctx=c.getContext('2d'),res=window.devicePixelRatio||1,
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
				pos+=13;
				core(y,l*y.length,p,[...ind,i]);
				pos+=13;
				calced.box.push({pos:tmp,ind:[...ind,i],dx:pos-tmp});
			}
			else{
				calced.note.push({pos,ind:[...ind,i],p});
				pos+=16;
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
	let w=c.parentNode.clientWidth,pos=w*.5-scr.scrollLeft;
	ctx.clearRect(0,0,w,240);
	calced.box.forEach(x=>{
		frr(ctx,'#4444',x.pos+pos,0,x.dx,240,4);
	});
	calced.note.forEach(x=>{
		frr(ctx,'#0004',x.pos+pos,0,16,240,4);
		let note=x.ind.reduce((a,y)=>a[y],main.scores);
		if(note)
			note.split(',').forEach(n=>{
				let col='#fea';
				if(n2i[n]==undefined){
					n=Number(n);col='#fea8';
					if(n>0)n=(n+9)%24-9;else n=(n+10)%24+14;
				}
				frr(ctx,col,x.pos+1+pos,225-Number(n2i[String(n)])*16,14,14,4);//240-16+1
			});
	});
},
init=()=>{
	//alert('ぷぇ');
	calc();
	draw();
};
scr.onscroll=()=>{draw()}
{
	(window.onresize=()=>{
		c.width=res*c.parentNode.clientWidth;
		c.height=res*240;
		ctx.scale(res,res);
		draw();
	})();

	main={
		scores:["-4","",["-4","-4"],["-4","-4"],["-9,-4,3","","-4,-2","-2"],["-7,-2,5","","3,-2","5"],["-5,0,7","","0,10","10"],["-5,-2,12","","-2,7","5"],["-9,-4,3","3","-4,7","7"],["-7,-2,5","3","-2,3","5"],["-5,0,7","","0,10",""],["-5,-2,7","","-2",""],["-9,-4,3","","-4,-2",""],["-7,-2,5","","-2,3","5"],["0,-5,7","","0,10",""],["-5,-2,7","","-2,5",""],["-9,-4,3","","-4,7",""],["-7,-2,5","","-2,7",""],["-9,-5,3","","-5,-2",""],["-9,-5","","7","10"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-9,-5,3","","-5,-2",""],["-9,-5,3","","3,5","3,10,7"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,14,10",""],["-5,-2,15,10,3","","-2,3,7","5"],["-9,-4,0","","7,3,-4",""],["-7,-2,2,5,10","","-2,7,3","5"],["-9,-5,3","","-5,-2",""],["-9,-5,0","","-2",""],["-9,-4","7,3"],["","-4","7,3",""],["5,-7,-2,2","","3","-2"],["2","","5,2,-2",""],["3,-5,0","","","0"],["","-2"],["-2,-5","-4"],["-5","-5"],["-9,-4","7,3"],["7,3","-4","7,3",""],["5,-7,-2,2","3"],["2","-2,-7"],["-2,-5,0","7,3"],["5","3,-5,0"],["7,2,-2,5,-5",""],["5,-2,2,-5","3"],["-9,-4","-2"],["7,-9,-4,3","10,7,3"],["-7,-2","7,3"],["2,-2,-7","3"],["-5,0","-2"],["7,3,-5,0","10,7,3"],["-5,-2","7,3"],["2,-5,-2","5"],["3,-9,-4","","","-4"],["","-2,-4"],["3,-4,-9",""],["-4","3"],["5,-7,-2,2","3"],["8,-7,-2,5","8,5"],["7,3","-4,-7"],["2","2,-7,-5"],["3,-5,0","3"],["3","-2,-5,0"],["5,-9,-4,2",""],["3,-4","3"],["5,-7,-2,2","3"],["3","8,-7,-2,5"],["7,-2,-9,3",""],["7,-5,2,5","5","3","2"],["3,-5,0","","","0"],["3","7,-5,0,3"],["10,-4,-9,7,3","3"],["3","3,-4,-9"],["5,-7,2,-2","7,3"],["5,2,-7,-2","3"],["3,-2,-9",""],["2","2,-5,-7"],["3,-5,0","3"],["3","-2,-5,0"],["5,-9,-4,2",""],["3,-4","3"],["5,-7,-2,2","3"],["3","8,-7,-2,5"],["7,-2,-9,3",""],["7,-5,2,5","5","3","2"],["3,-5,0","","","0"],["3","7,-5,0,3"],["-5,-2,8,5","7,3"],["-5,-2,5","3"],["-9,-4,5,3",""],["-9,-4","-2"],["-4,-9,-2","-2"],["-4,-9,7,3","5,3"],["-7,-2,5,2",""],["3","-7,2,-2"],["-7,2,-4",""],["-5,-7,7,3","3"],["-9,-4,3","","-4,-2","-2"],["-7,-2,5,2","","3,-2","5"],["-5,0,7,3","","0,10,7,3","10,7,3"],["-5,-2,12,7,3","","-2,7,3","5"],["-9,-4,3","3","-4,7,3","7,3"],["-7,-2,5,2","3","-2,3","5,2"],["-5,0,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2",""],["-9,-4,3","","-4,-2",""],["-7,-2,5,2","","-2,3","5"],["0,-5,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2,5,3","3"],["-9,-4,3","","-4,7,3",""],["-7,-2,5,2","","-2,7,5,2",""],["-9,-5,3","","-5,-2",""],["-9,-5","","0","2"],["-9,-4,3","","-4,-2","-2"],["-7,-2,5,2","","3,-2","5"],["-5,0,7,3","","0,10,7,3","10,7,3"],["-5,-2,12,7,3","","-2,7,3","5"],["-9,-4,3","3","-4,7,3","7,3"],["-7,-2,5,2","3","-2,3","5,2"],["-5,0,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2",""],["-9,-4,3","","-4,-2",""],["-7,-2,5,2","","-2,3","5"],["0,-5,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2,5,3",""],["-9,-4,3","","-4,7,3",""],["-7,-2,5,2","","-2,7,5,2",""],["-9,-5,3","","-5,-2",""],["-9,-5","","7,3","7,3,10"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-9,-5,3","","-5,-2",""],["-9,-5,3","","3,5","3,10,7"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,14,10",""],["-5,-2,15,10,3","","-2,3,7","5"],["-9,-4,0","","7,3,-4",""],["-7,-2,2,5,10","","-2,7,3","5"],["-9,-5,3","","-5,-2",""],["-5,-9",""],"","","",""],
		sc:-2,
		bpm:120
	};

	init();
}