var imgurl=[],imgres=[[0,0],[0,0],[0,0],[0,0]],dftflag;
const read=(_this)=>{
	var reader = new FileReader();
	var d = document.getElementById(_this.id+"d").style;
	var num = parseInt(_this.id.slice(-1));
	reader.addEventListener('load', ()=>{d.backgroundImage="url('"+reader.result+"')";imgurl[num]=reader.result;tex(num);}, false);
	reader.addEventListener('error',()=>{d.backgroundImage="linear-gradient(#f0f,#f0f)";log.innerText+="\nERROR: "+_this.id+" loading failed"},false);
	reader.readAsDataURL(_this.files[0]);
	console.log(_this.id,imgurl,reader);
}
diffuse.ontouchstart=()=>{dftflag=true;diffuse.src=canvas.toDataURL();}
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
const copy=(str)=>{
	var tmp=document.createElement("div");
	var pre=document.createElement("pre");
	pre.style.webkitUserSelect="auto";pre.style.userSelect="auto";
	tmp.appendChild(pre).textContent = str;
	var s=tmp.style;s.position="fixed";s.right="200%";
	document.body.appendChild(tmp);
	document.getSelection().selectAllChildren(tmp);
	var result=document.execCommand("copy");
	document.body.removeChild(tmp);
	return result;
}
const resize=(c,prv,gl,w,h)=>{
	if(c.width!=w){c.width=w;prv.width=w;}
	if(c.height!=h){c.height=h;prv.height=h;}
	gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
}

var c = document.getElementById("canvas"),prv = document.getElementById("preview");
var gl = c.getContext("webgl") || c.getContext("experimental-webgl"),prvctx = prv.getContext("2d");
prvctx.imageSmoothingEnabled = false;
resize(c,prv,gl,w_.value,h_.value);
gl.enable(gl.CULL_FACE);
gl.frontFace(gl.CCW);//gl.frontFace(gl.CW);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.enable(gl.BLEND);
gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
gl.getExtension("OES_standard_derivatives");
function create_shader(f){
	if(f){var shader = gl.createShader(gl.FRAGMENT_SHADER);var src = fsh_e.getValue();}
	else{var shader = gl.createShader(gl.VERTEX_SHADER); var src = "attribute vec2 UV;void main(){gl_Position=vec4(UV,0,1);}";}
	gl.shaderSource(shader, "#extension GL_OES_standard_derivatives : enable\n#define round(x) floor(x+.5)\n"+src);
	gl.compileShader(shader);
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS))return shader;
	else log.innerText += gl.getShaderInfoLog(shader);
}
function create_program(vsh, fsh){
	var program = gl.createProgram();
	gl.attachShader(program, vsh);
	gl.attachShader(program, fsh);
	gl.linkProgram(program);
	log.innerText += gl.getProgramInfoLog(program);
	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
		gl.useProgram(program);
		return program;
	}
}
function compile(){
	log.textContent = "";
	prg = create_program(create_shader(0),create_shader(1));
	if(log.textContent=="")log.insertAdjacentHTML('beforeend',"<span style='color:#6b4;'>compile succeeded.</span>");
}
compile();
//attribute
var UV = gl.getAttribLocation(prg, "UV");
var uv_v = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uv_v);
gl.enableVertexAttribArray(UV);
gl.vertexAttribPointer(UV, 2, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, null);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());//ibo
	gl.bindBuffer(gl.ARRAY_BUFFER, uv_v);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array([0,1,2, 3,2,1]), gl.STATIC_DRAW);
//texture
var texture = [];
function tex(i){
	var img = new Image();
	img.onload = function() {
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);//バインドセット
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);//y反転
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);//読み込み
		gl.generateMipmap(gl.TEXTURE_2D);//生成
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);//拡大縮小
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);//端数処理
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);//バインド解除
		imgres[i] = [img.naturalWidth,img.naturalHeight];
		texture[i] = tex;
		console.log("imgurl["+i+"] loaded as tex",imgres[i]);
	}
	img.src = imgurl[i];
}
var t=0,fps=fps_.value,fpstm;
var prc;//二重起動防止
function main(){
	clearTimeout(prc);
	if(Math.floor(new Date().getMilliseconds()*.010)!=Math.floor(new Date(fpstm).getMilliseconds()*.010))
		fpslog.textContent = Math.round(10000/(new Date()-fpstm))/10+" fps\n";
	fpstm = new Date();
	t+=1/fps;
	gl.clearColor(0,0,0,0);
	gl.clearDepth(1.);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var uniform = [
		gl.getUniformLocation(prg, "time"),
		gl.getUniformLocation(prg, "res"),
		gl.getUniformLocation(prg, "tex0res"),
		gl.getUniformLocation(prg, "tex1res"),
		gl.getUniformLocation(prg, "tex2res"),
		gl.getUniformLocation(prg, "tex3res"),
		gl.getUniformLocation(prg, "tex0"),
		gl.getUniformLocation(prg, "tex1"),
		gl.getUniformLocation(prg, "tex2"),
		gl.getUniformLocation(prg, "tex3")
	];
	gl.uniform1f(uniform[0], t);
	gl.uniform2fv(uniform[1], [c.width,c.height]);
	gl.uniform2fv(uniform[2], imgres[0]);
	gl.uniform2fv(uniform[3], imgres[1]);
	gl.uniform2fv(uniform[4], imgres[2]);
	gl.uniform2fv(uniform[5], imgres[3]);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture[0]);
	gl.uniform1i(uniform[6], 0);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture[1]);
	gl.uniform1i(uniform[7], 1);
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, texture[2]);
	gl.uniform1i(uniform[8], 2);
	gl.activeTexture(gl.TEXTURE3);
	gl.bindTexture(gl.TEXTURE_2D, texture[3]);
	gl.uniform1i(uniform[9], 3);

	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	gl.flush();
	mslog.textContent = new Date(new Date()-fpstm).getMilliseconds()+" ms/frame";
	prvctx.drawImage(c,0,0,prv.width,prv.height);

	prc = setTimeout(main, 1000/fps);
}
main();
