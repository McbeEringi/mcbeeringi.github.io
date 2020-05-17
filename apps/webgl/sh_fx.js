function compile(){
	document.getElementById("log").innerHTML = "";
	prg = create_program(create_shader("vsh"), create_shader("fsh"));
}
function radio(){
	model(document.getElementById("model").model.value);//models.js
	gl.bindBuffer(gl.ARRAY_BUFFER, pos_v);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, col_v);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ARRAY_BUFFER, uv1_v);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv1), gl.STATIC_DRAW);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);
}
function clear(c){
	gl.clearColor(c[0],c[1],c[2],c[3]);
	gl.clearDepth(1.);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
function create_shader(id){
	if(id=="vsh"){var shader = gl.createShader(gl.VERTEX_SHADER);var src = vsh.getValue()}
	else if(id=="fsh"){var shader = gl.createShader(gl.FRAGMENT_SHADER); var src = fsh.getValue()}
	gl.shaderSource(shader, glpre+src);
	gl.compileShader(shader);
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS))return shader;
	else document.getElementById("log").innerHTML += id+" ERROR\n"+gl.getShaderInfoLog(shader);
}
function create_program(vsh, fsh){
	var program = gl.createProgram();
	gl.attachShader(program, vsh);
	gl.attachShader(program, fsh);
	gl.linkProgram(program);
	document.getElementById("log").innerHTML += gl.getProgramInfoLog(program);
	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
		gl.useProgram(program);
		return program;
	}
}
function att(vbo, attL, attS){
	for(var i in vbo){//引数として受け取った配列を処理する
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);//バッファをバインドする
		gl.enableVertexAttribArray(attL[i]);//attributeLocationを有効にする
		gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);//attributeLocationを通知し登録する
		gl.bindBuffer(gl.ARRAY_BUFFER, null);//バッファのバインドを無効化
	}
}
function tex(url,num){
	var img = new Image();
	img.onload = function() {
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);//バインドセット
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);//読み込み
		gl.generateMipmap(gl.TEXTURE_2D);//生成
		gl.bindTexture(gl.TEXTURE_2D, null);//バインド解除
		texture[num] = tex;
	}
	img.src = url;
}
