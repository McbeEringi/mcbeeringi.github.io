class PetitGL{
	constructor(c=document.createElement('canvas')){
		let gl=c.getContext('webgl',{preserveDrawingBuffer:true})||c.getContext('experimental-webgl',{preserveDrawingBuffer:true});
		gl.clearColor(0,0,0,0);
		gl.enable(gl.CULL_FACE);gl.frontFace(gl.CCW);
		gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearDepth(1);
		gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE);
		if(gl.getExtension('OES_standard_derivatives'))console.log('OES_standard_derivatives');
		console.log(gl);
		this.gl=gl;this.c=c;
		this.log='';this.prg_={};
		this.uni_={};this.tex_={};
		this.ibol={};
		return this;
	}
	resize(w,h){this.c.width=w;this.c.height=h;this.gl.viewport(0,0,this.c.width,this.c.height);return this;}
	_sh(gl,t,src){
		let sh=gl.createShader(t?gl.FRAGMENT_SHADER:gl.VERTEX_SHADER);
		gl.shaderSource(sh,'#define round(x) floor(x+.5)\n'+src);
		gl.compileShader(sh);
		console.log(t?'fsh':'vsh',sh);
		return{sta:gl.getShaderParameter(sh,gl.COMPILE_STATUS),dat:sh,log:gl.getShaderInfoLog(sh)};
	}
	_prg(gl,v,f){
		let prg=gl.createProgram();
		gl.attachShader(prg,v);gl.attachShader(prg,f);gl.linkProgram(prg);
		console.log(prg);
		return{sta:gl.getProgramParameter(prg,gl.LINK_STATUS),dat:prg,log:gl.getProgramInfoLog(prg)};
	}
	compile(name,vsh,fsh){
		this.log='';
		if(typeof vsh=='string')vsh=this._sh(this.gl,0,vsh);
		if(typeof fsh=='string')fsh=this._sh(this.gl,1,fsh);
		if(vsh.sta&&fsh.sta)this.prg_[name]=this._prg(this.gl,vsh.dat,fsh.dat);//prg
		else this.log+=`${name} vsh:\n${vsh.log}\n${name} fsh:\n${fsh.log}\n\n`;
		return this;
	}
	defUni(name,unis){//unis: [...{name,type}], type: "float,vec2,vec3,vec4,int,ivec2,ivec3,ivec4,mat2,mat3,mat4,tex"
		let tmp={};
		for(const x of unis)tmp[x.name]=[this.gl.getUniformLocation(this.prg_[name].dat,x.name),x.type];
		this.uni_[name]=tmp;
		return this;
	}
	tex(urls){//urls: [...{texname,url}]
		const core=(gl,img)=>{
				let tex=gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D,tex);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
				gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
				let nw=img.naturalWidth,nh=img.naturalHeight;
				if(((nw&(nw-1))==0)&&((nh&(nh-1))==0))
					gl.generateMipmap(gl.TEXTURE_2D);
				else{
					console.log('tex mipmap canceled');
					gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
				}
				gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
				gl.bindTexture(gl.TEXTURE_2D,null);
				console.log(img,tex);
				return{tex:tex,size:[nw,nh]};
			};
		for(const x of urls){
			const img=new Image();
			img.onload=()=>this.tex_[x.texname]=core(this.gl,img);
			img.src=x.url;
		}
		return this;
	}
	att(name,atts,iboi){//atts: [...{name,data,length}]
		console.log(atts);
		let aloc=atts.map(x=>this.gl.getAttribLocation(this.prg_[name].dat,x.name)),
			vbo=atts.map(()=>this.gl.createBuffer());
		for(let i=0;i<atts.length;i++){
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER,vbo[i]);
			this.gl.enableVertexAttribArray(aloc[i]);
			this.gl.vertexAttribPointer(aloc[i],atts[i].length,this.gl.FLOAT,false,0,0);
			this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(atts[i].data),this.gl.STATIC_DRAW);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null);
		}
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this.gl.createBuffer());//ibo
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,new Int16Array(iboi),this.gl.STATIC_DRAW);
		this.ibol[name]=iboi.length;
		return this;
	}
	uni(name,unis){//unis: [...{name,data(,rname)}], data: Array,texname
		let fi={
				float:'uniform1fv',vec2:'uniform2fv',vec3:'uniform3fv',vec4:'uniform4fv',
				int:'uniform1iv',ivec2:'uniform2iv',ivec3:'uniform3iv',ivec4:'uniform4iv'
			},m={
				mat2:'uniformMatrixfv',mat3:'uniformMatrixfv',mat4:'uniformMatrixfv'
			},texi=0;
		for(const x of unis){
			let [loc,type]=this.uni_[name][x.name],tmp;
			if(tmp=fi[type])this.gl[tmp](loc,x.data);
			else if(tmp=m[type])this.gl[tmp](loc,false,x.data);
			else if(type=='tex'){
				if(!this.tex_[x.data]){console.log(`"${x.data}" might be loading or not defined.`);continue;}
				this.gl.activeTexture(this.gl['TEXTURE'+texi]);
				this.gl.bindTexture(this.gl.TEXTURE_2D,this.tex_[x.data].tex);
				this.gl.uniform1i(loc,texi);
				if(x.rname){
					[loc,type]=this.uni_[name][x.rname];
					if(type=='vec2')this.gl.uniform2fv(loc,this.tex_[x.data].size);
					else console.log(`tex resolution type must be vec2. "${x.rname}" skipped.`);
				}
				texi++;
			}
			else console.log(`unknown type: ${type}`);
		}
		return this;
	}
	draw(name,fb){
		this.gl.useProgram(this.prg_[name].dat);
		if(fb)this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,fb.f);
		this.gl.clearColor(0,0,0,0);this.gl.clearDepth(1);this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
		this.gl.drawElements(this.gl.TRIANGLES,this.ibol[name],this.gl.UNSIGNED_SHORT,0);
		if(fb)this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
		else this.gl.flush();
		return this;
	}
}
