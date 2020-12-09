var imgres=[],dftflag,curdat,curname;
diffuse.addEventListener('touchstart',()=>{dftflag=true;diffuse.src=canvas.toDataURL();},{passive:true})
diffuse.onmousedown=()=>{if(dftflag)dftflag=false;else diffuse.src=canvas.toDataURL();}
const llog=x=>log.insertAdjacentHTML('beforeend',x),
copy=x=>{navigator.clipboard.writeText(x).catch(e=>console.log(e));return x;};

var c = document.getElementById("canvas"),gl = WebGL.setup(c,true,true);
var prv = document.getElementById("preview"),prvctx = prv.getContext("2d");prvctx.imageSmoothingEnabled = false;
const vsh='attribute vec2 UV;void main(){gl_Position=vec4(UV,0,1);}';
var prg=WebGL.compile(gl,vsh,'void main(){gl_FragColor=vec4(0);}');

const resize=(c,prv,gl,w,h)=>{
	c.width=w;prv.width=w;c.height=h;prv.height=h;
	gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
},
read=x=>{
	var url=URL.createObjectURL(x.files[0]);
	document.getElementById(x.id+'d').style.backgroundImage=`url(${url})`;
	tex(parseInt(x.id.slice(-1)),url);
}

WebGL.attributes(gl,prg,[{name:'UV',data:[-1,-1,1,-1,-1,1,1,1],length:2}],[0,1,2,3,2,1]);

var texture=[],t0=new Date(),t,fps=fps_.value,fpstm,prc;//二重起動防止
const tex=(i,url)=>{
	WebGL.texture(gl,url,x=>{
		texture[i]=x;
		console.log(i+" loaded as tex",x);
		imgres[i]=[x.width,x.height];
		document.getElementById(i+"reslog").textContent=imgres[i].join(", ");
	});
},
main=()=>{
	clearTimeout(prc);
	fpstm=new Date()-fpstm;
	fpslog.textContent = (1000/fpstm).toFixed(1)+' fps';
	fpstm=new Date();
	t=((fpstm-t0)*.001).toFixed(3);
	timelog.textContent = t;

	WebGL.uniforms(gl,prg,[
		{name:'time',type:'1f',data:Number(t)},
		{name:'res',type:'2f',data:[c.width,c.height]},
		{name:'tex0',type:'tex',rname:'tex0res',data:texture[0]},
		{name:'tex1',type:'tex',rname:'tex1res',data:texture[1]},
		{name:'tex2',type:'tex',rname:'tex2res',data:texture[2]},
		{name:'tex3',type:'tex',rname:'tex3res',data:texture[3]},
	]);

	prvctx.clearRect(0,0,prv.width,prv.height);
	WebGL.draw(gl);
	prvctx.drawImage(c,0,0,prv.width,prv.height);

	prc = setTimeout(main, 1000/fps);
},
compile=()=>{
	log.textContent='';
	prg = WebGL.compile(gl,vsh,fsh_e.getValue());
	llog(WebGL.log||'<span style="color:#6b4;">compile succeeded.</span>');
}


const thumb=()=>{var prvtmp=[prv.width,prv.height];prv.width=32;prv.height=32;prvctx.drawImage(c,0,0,prv.width,prv.height);var s=prv.toDataURL();prv.width=prvtmp[0];prv.height=prvtmp[0];return s;},
save=s=>{
	curdat={
		fsh:fsh_e.getValue(),
		size:[w_.value,h_.value],
		fps:fps_.value,
		thumb:thumb()
	}
	localStorage.fsh_curdat=JSON.stringify(curdat);
	if(s)llog("\n<span style='color:#48f;'>auto saved.</span>");else console.log("saved");
},
expurl=()=>'mcbeeringi.github.io/apps/webgl/fsh.html#'+encodeURIComponent(JSON.stringify(curdat)).replace(/\(/g,"%28").replace(/\)/g,"%29"),
inpurl=()=>{
	var data = location.hash.slice(1);
	if(data){
		data=JSON.parse(decodeURIComponent(data.replace(/%28/g,"(").replace(/%29/g,")")));
		fsh_e.setValue(unescape(data.fsh),-1);
		if(data.size){w_.value = data.size[0];h_.value = data.size[1];}
		if(data.fps)fps_.value = data.fps;
	}
	else if(localStorage.fsh_curdat){
		data=JSON.parse(localStorage.fsh_curdat);
		w_.value = data.size[0];h_.value = data.size[1];fps_.value = data.fps;
		fsh_e.setValue(data.fsh,-1);
		llog("<span style='color:#48f;'>loaded from cache</span>");
	}
};

const saveas=()=>{
	var name=prompt();if(name==null)return;
	curname=name||('untitled '+new Date().toLocaleString());
	var dat=JSON.parse(localStorage.fsh_datli||'{}');
	dat[curname]={thumb:curdat.thumb};console.log(dat);
	localStorage.fsh_datli=JSON.stringify(dat);
	localStorage['fsh_dat_'+curname]=JSON.stringify(curdat);
},
loadfrom=()=>{
	//curdat=localStorage['dat_'+]
};


inpurl();save();resize(c,prv,gl,w_.value,h_.value);compile();main();
addEventListener('load',()=>{
	var comp_timer,save_timer;
	fsh_e.on("input",()=>{
		console.log('inp');
		clearTimeout(comp_timer);comp_timer=setTimeout(compile,500);
		clearTimeout(save_timer);comp_timer=setTimeout(save,wait_.value,1);
	});
})
