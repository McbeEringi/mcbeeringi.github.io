//Created by @McbeEringi CC0
//build: 2109060
//example: https://mcbeeringi.github.io/amuse/petitgl.html
'use strict'
class PetitGL{
	constructor(c=document.createElement('canvas')){
		let gl=c.getContext('webgl',{preserveDrawingBuffer:true})||c.getContext('experimental-webgl',{preserveDrawingBuffer:true});
		gl.clearColor(0,0,0,0);
		gl.enable(gl.CULL_FACE);gl.frontFace(gl.CCW);
		gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearDepth(1);
		gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE);
		if(gl.getExtension('OES_standard_derivatives'))console.log('OES_standard_derivatives');
		console.log(gl);
		this.gl=gl;this.c=c;this.log='';this.prg_={};
		this.uni_={};this.tex_={};this.ibo_={};
		this.buffer_={};this.att_={};
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
	_mip(gl,w,h){
		if(((w&(w-1))==0)&&((h&(h-1))==0))gl.generateMipmap(gl.TEXTURE_2D);
		else{
			console.log('mipmap canceled');
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
		}
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
	}
	compile(name,vsh,fsh){
		this.log='';
		if(typeof vsh=='string')vsh=this._sh(this.gl,0,vsh);
		if(typeof fsh=='string')fsh=this._sh(this.gl,1,fsh);
		if(vsh.sta&&fsh.sta)this.prg_[name]=this._prg(this.gl,vsh.dat,fsh.dat);//prg
		else this.log+=`${name} vsh:\n${vsh.log}\n${name} fsh:\n${fsh.log}\n\n`;
		return this;
	}
	tex(urls){//urls: [...{texname,url,fx}]
		const core=(gl,img)=>{
				let tex=gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D,tex);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
				gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
				let nw=img.naturalWidth,nh=img.naturalHeight;
				this._mip(this.gl,nw,nh);
				gl.bindTexture(gl.TEXTURE_2D,null);
				console.log(img,tex);
				return{tex:tex,size:[nw,nh]};
			};
		for(const x of urls){
			const img=new Image();
			img.onload=()=>{let tmp=core(this.gl,img);this.tex_[x.texname]=tmp;if(x.fx)x.fx(tmp);};
			img.src=x.url;
		}
		return this;
	}
	defAtt(name,atts,iboi){//atts: [...{name,data,length}]
		let gl=this.gl,tmp={},ibo=gl.createBuffer();
		for(const x of atts){
			let vbo=gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
			gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(x.data),gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER,null);
			tmp[x.name]={loc:gl.getAttribLocation(this.prg_[name].dat,x.name),vbo,length:x.length};
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Int16Array(iboi),gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
		this.att_[name]=tmp;this.ibo_[name]={dat:ibo,length:iboi.length};
		return this;
	}
	defUni(name,unis){//unis: [...{name,type}], type: "float,vec2,vec3,vec4,int,ivec2,ivec3,ivec4,mat2,mat3,mat4,tex"
		let tmp={};
		for(const x of unis)tmp[x.name]=[this.gl.getUniformLocation(this.prg_[name].dat,x.name),x.type];
		this.uni_[name]=tmp;
		return this;
	}
	att(name,atts){//atts: [...{name,data}]
		const gl=this.gl;
		for(const x of atts){
			gl.bindBuffer(gl.ARRAY_BUFFER,this.att_[name][x.name].vbo);
			gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(x.data),gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER,null);
		}
		return this;
	}
	uni(name,unis){//unis: [...{name,data(,rname)}], data: Array||texname
		let gl=this.gl,
			fi={
				float:'uniform1fv',vec2:'uniform2fv',vec3:'uniform3fv',vec4:'uniform4fv',
				int:'uniform1iv',ivec2:'uniform2iv',ivec3:'uniform3iv',ivec4:'uniform4iv'
			},m={
				mat2:'uniformMatrixfv',mat3:'uniformMatrixfv',mat4:'uniformMatrixfv'
			},texi=0;
		for(const x of unis){
			let [loc,type]=this.uni_[name][x.name],tmp;
			if(tmp=fi[type])gl[tmp](loc,x.data);
			else if(tmp=m[type])gl[tmp](loc,false,x.data);
			else if(type=='tex'){
				if(!this.tex_[x.data])continue;
				gl.activeTexture(gl['TEXTURE'+texi]);
				gl.bindTexture(gl.TEXTURE_2D,this.tex_[x.data].tex);
				gl.uniform1i(loc,texi);
				if(x.rname){
					[loc,type]=this.uni_[name][x.rname];
					if(type=='vec2')gl.uniform2fv(loc,this.tex_[x.data].size);
					else console.log(`tex resolution type must be vec2. "${x.rname}" skipped.`);
				}
				texi++;
			}
			else console.log(`unknown type: ${type}`);
		}
		return this;
	}
	buffer(buffs){//buffs: [...{bname,texname(,w,h)}]
		const gl=this.gl;
		for(const x of buffs){
			let f=gl.createFramebuffer(),d=gl.createRenderbuffer(),t=gl.createTexture(),w=x.w||this.c.width,h=x.h||this.c.height;
			gl.bindFramebuffer(gl.FRAMEBUFFER,f);
			gl.bindRenderbuffer(gl.RENDERBUFFER,d);
			gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,d);
			gl.bindTexture(gl.TEXTURE_2D,t);
			gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
			this._mip(gl,w,h);
			gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
			gl.bindTexture(gl.TEXTURE_2D,null);
			gl.bindRenderbuffer(gl.RENDERBUFFER,null);
			gl.bindFramebuffer(gl.FRAMEBUFFER,null);
			this.buffer_[x.bname]={f,d,t};
			if(this.tex_[x.texname])console.log(`${this.tex_[x.texname]} is overwritten by buffer ${x.bname}.`);
			this.tex_[x.texname]={tex:t,size:[w,h]};
		}
		return this;
	}
	draw(name,bname){
		const gl=this.gl;
		gl.useProgram(this.prg_[name].dat);
		if(bname)gl.bindFramebuffer(gl.FRAMEBUFFER,this.buffer_[bname].f);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);//gl.clearColor(0,0,0,0);gl.clearDepth(1);
		for(const i in this.att_[name]){
			const tmp=this.att_[name][i];
			gl.bindBuffer(gl.ARRAY_BUFFER,tmp.vbo);
			gl.enableVertexAttribArray(tmp.loc);
			gl.vertexAttribPointer(tmp.loc,tmp.length,gl.FLOAT,false,0,0);
			gl.bindBuffer(gl.ARRAY_BUFFER,null);
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibo_[name].dat);
		gl.drawElements(gl.TRIANGLES,this.ibo_[name].length,gl.UNSIGNED_SHORT,0);
		if(bname)gl.bindFramebuffer(gl.FRAMEBUFFER,null);
		else gl.flush();
		return this;
	}
}
