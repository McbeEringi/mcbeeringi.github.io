var imgres=[,,,],dftflag;
const read=x=>{
	var url=URL.createObjectURL(x.files[0]);
	document.getElementById(x.id+'d').style.backgroundImage=`url(${url})`;
	tex(parseInt(x.id.slice(-1)),url);
}
diffuse.addEventListener('touchstart',()=>{dftflag=true;diffuse.src=canvas.toDataURL();},{passive:true})
diffuse.onmousedown=()=>{if(dftflag)dftflag=false;else diffuse.src=canvas.toDataURL();}

const load=()=>{
	var data = location.hash.slice(1);
	if(data){
		data=JSON.parse(decodeURIComponent(data.replace(/%28/g,"(").replace(/%29/g,")")));
		fsh_e.setValue(unescape(data.fsh),-1);
		if(data.size){w_.value = data.size[0];h_.value = data.size[1];}
		if(data.fps)fps_.value = data.fps;
	}
}
load();
const save=(s)=>{
	var data = {
		"fsh":fsh_e.getValue(),
		"size":[w_.value,h_.value],
		"fps":fps_.value
	}
	location.hash = encodeURIComponent(JSON.stringify(data)).replace(/\(/g,"%28").replace(/\)/g,"%29");
	if(s)log.insertAdjacentHTML('beforeend',"\n<span style='color:#48f;'>auto saved.</span>");else console.log("saved");
}
const copy=x=>{navigator.clipboard.writeText(x).catch(e=>console.log(e));return x;}
const resize=(c,prv,gl,w,h)=>{
	c.width=w;prv.width=w;c.height=h;prv.height=h;
	gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
}

var c = document.getElementById("canvas"),gl = WebGL.setup(c,true,true);
var prv = document.getElementById("preview"),prvctx = prv.getContext("2d");prvctx.imageSmoothingEnabled = false;
resize(c,prv,gl,w_.value,h_.value);
var prg;

function compile(){
	log.textContent='';
	prg = WebGL.compile(gl,'attribute vec2 UV;void main(){gl_Position=vec4(UV,0,1);}',fsh_e.getValue());
	if(!WebGL.log)log.insertAdjacentHTML('beforeend','<span style="color:#6b4;">compile succeeded.</span>');
	else log.insertAdjacentHTML('beforeend',WebGL.log);
}
compile();

WebGL.attributes(gl,prg,[{name:'UV',data:[-1,-1,1,-1,-1,1,1,1],length:2}],[0,1,2,3,2,1]);
//texture
var texture=[];
function tex(i,url){
	WebGL.texture(gl,url,x=>{
		texture[i]=x;
		console.log(i+" loaded as tex",x);
		imgres[i]=[x.width,x.height];
		document.getElementById(i+"reslog").textContent=imgres[i].join(", ");
	});
}
var t0=new Date(),t,fps=fps_.value,fpstm,prc;//二重起動防止
function main(){
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
}
main();
