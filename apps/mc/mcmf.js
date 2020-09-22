//https://qiita.com/psn/items/d7ac5bdb5b5633bae165
const uuidgen=()=>'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split('').map(e=>{switch(e){case'x':return Math.floor(Math.random()*16).toString(16);case'y':return (Math.floor(Math.random()*4)+8).toString(16);default:return e;}}).join('');
const simple_mcmf=x=>{
	var r={},h={},m={},tmp={};
	switch(typeof x){
		case'string':x.split('; ').map(c=>tmp[c.substr(0,1)]=c.substr(1));tmp.v=JSON.parse(tmp.v);if(tmp.m)tmp.m=JSON.parse(tmp.m);break;
		case'object':break;
	}
	console.log(tmp)
	r.format_version=1;
	h.name=tmp.n;h.description=tmp.d;h.version=tmp.v;
	if(tmp.m){h.min_engine_version=tmp.m;if(Number(tmp.m.join(''))>=1130)r.format_version=2;}
	m.type=tmp.t;m.version=tmp.v;
	h.uuid=uuidgen();m.uuid=uuidgen();r.header=h;r.modules=[m];
	return JSON.stringify(r);
}
