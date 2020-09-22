//https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
const uuidgen=()=>'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split('').map(e=>{switch(e){case'x':return Math.floor(Math.random()*16).toString(16);case'y':return (Math.floor(Math.random()*4)+8).toString(16);default:return e;}}).join('');
const simple_mcmf=x=>{
	if(typeof x=='string')x=JSON.parse(x.replace('\n','\\n'));
	var r={},h={},m={};
	r.format_version=1;
	h.name=x.n;h.description=x.d;h.version=x.v;
	if(x.mv){h.min_engine_version=x.mv;if(Number(x.mv.join(''))>=1130)r.format_version=2;}
	m.type=x.t;m.version=x.v;
	h.uuid=uuidgen();m.uuid=uuidgen();r.header=h;r.modules=[m];
	return JSON.stringify(r);
}
