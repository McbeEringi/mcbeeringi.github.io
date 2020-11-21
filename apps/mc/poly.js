const fx = str=>str.replace(/\n/g,"").split(" ").map(x=>x.replace(/0+$/g,"")).slice(1).map(x=>Number(x));
const time = ()=>{var d=new Date();return `${('0'+d.getHours()).slice(-2)}:${('0'+d.getMinutes()).slice(-2)}:${('0'+(d.getSeconds()+d.getMilliseconds()/1e3).toFixed(3)).slice(-6)}`;};
var m=['',''];
function core(s,posf,nf,uvf,i,cffx){
	console.log("core()");
	//log.textContent += time()+"[info] started…\n";
	m[0]=m[1];
	var tmpm = s.match(/^usemtl\s.+$/gm);
		if(tmpm){tmpm = tmpm.map(x=>x.replace(/\n/g,"").replace(/^usemtl\s/,""));m=[tmpm.filter((x,i,a)=>a.indexOf(x)==i),tmpm.pop()];}
	var o = s.match(/^o\s.+$/m);
		if(o){o = o[0].replace(/\n/g,"").replace(/^o\s/,"");}
		else{self.postMessage(time()+"[info] o not found\n");o="poly"+i;}
	var pos = s.match(/^v\s.+$/gm);
		if(!pos){self.postMessage(time()+"[error] v not found\n");return;}
		pos = pos.map(fx).map(v=>eval(cffx[0]));
	var n = s.match(/^vn\s.+$/gm);
		if(n){n = n.map(fx);}
		else{self.postMessage(time()+"[info] vn not found\n");n=[[0,1,0]];}
		n = n.map(vn=>eval(cffx[1]));
	var uv = s.match(/^vt\s.+$/gm);
		if(uv){uv = uv.map(fx);}
		else{self.postMessage(time()+"[info] vt not found\n");uv=[[0,0]];}
		uv = uv.map(vt=>eval(cffx[2]));
	var pol = s.match(/^f\s.+$/gm);
		if(pol)pol = pol.map(str=>{str=str.replace(/\n/g,"").split(" ").map(x=>{x=x.split("/").map(x=>x?x-1:x);return [x[0]-posf,x[2]?x[2]-nf:0,x[1]?x[1]-uvf:0]}).slice(1);return [str[0],str[1],str[2],str[str[3]?3:0]]});
		else{self.postMessage(`${time()}[info] f not found… '${o}' skipped\n`);return ["",pos.length,n.length,uv.length];}
	console.log(o,pos,uv,n,pol);
	s = `{"name":"${o}","pivot":[0,0,0],"poly_mesh":{"normalized_uvs":true,"positions":${JSON.stringify(pos)},"normals":${JSON.stringify(n)},"uvs":${JSON.stringify(uv)},"polys":${JSON.stringify(pol)}}},\n`;
	self.postMessage(`${time()}[info] '${o}' done	material:[${m[0]}]\n`);
	return [s,pos.length,n.length,uv.length];
}
function main(data){
	console.log("main()");
	self.postMessage(time()+"[info] all convertions started\n");
	var posf=0,nf=0,uvf=0,diffuse="",tmp;
	var s=data.s,format=data.format,o=data.fname;
	if(!s){self.postMessage(time()+"[error] Input not found\n");return ["error"];}
	if(s.match(/^o\s.+$/m))s = ("o\n#\n"+s).split(/\n(?=o)/).slice(1);
	else s=[s];
	console.log(s);
	for(var i=0;i<s.length;i++){
		tmp = core(s[i],posf,nf,uvf,i,data.cffx);
		if(tmp){diffuse+=tmp[0]; posf+=tmp[1]; nf+=tmp[2]; uvf+=tmp[3];}
		else {return["error"];}
	}
	diffuse = diffuse.slice(0,-2);
	if(format){
		o=format[0];
		diffuse=format[1].replace('NAME',o).replace('OBJ',diffuse);
	}
	self.postMessage(time()+"[info] all convertions completed");
	return [o,diffuse];
}
self.addEventListener('message',msg=>{
	console.log(msg.data);
	self.postMessage({"diffuse":main(msg.data)});
});
