const csys=(w,r)=>w.reduce((a,x)=>(
	x.rel^r&&(x.rel=r,{m:[0,1],l:[0,1],h:[0],v:[1],z:[],c:[0,1,0,1,0,1],s:[0,1,0,1],q:[0,1,0,1],t:[0,1],a:[0,1,,,,0,1]}[x.cmd]).forEach((y,i)=>x.dat[i]+=r?-a[y]:a[y]),
	({h:[x.dat[0],0],v:[0,x.dat[0]],z:[a[2],a[3]]}[x.cmd]||x.dat.slice(-2)).forEach((y,i)=>a[i]=y+a[i]*r),
	x.cmd=='m'&&(a[2]=a[0],a[3]=a[1]),a.push(x),a
),[0,0,0,0]).slice(4);
export default class{
	constructor(w){
		this.d=w.match(/[mlhvzcsqta]|-?\d*\.?\d+/ig).reduce((a,x,y)=>(y=a[a.length-1],isNaN(x)?
			(y&&y.dat.length!=y.len&&(y.err=!0),a.push({cmd:y=x.toLowerCase(),rel:x==y,dat:[],len:{m:2,l:2,h:1,v:1,z:0,c:6,s:4,q:4,t:2,a:7}[y]})):
			y&&y.dat.length<y.len?y.dat.push(+x):a.push({...y,dat:[+x]}),
		a),[]);
		return this;
	}
	absolute(){this.d=csys(this.d,!1);return this;}relaive(){this.d=csys(this.d,!0);return this;}
	matrix(w=[1,0,0,0,1,0]){return this;}
	rotate(t=0){const s=Math.sin(t),c=Math.cos(t);this.matrix([c,-s,0,s,c,0]);return this;}scale(x=1,y=1){this.matrix([x,0,0,0,y,0]);return this;}
	skew(x=0,y=0){this.matrix([1,Math.tan(x),0,Math.tan(y),1,0]);return this;}translate(x=0,y=0){this.matrix([1,0,x,0,1,y]);return this;}
	toString(){return this.d.reduce((a,x)=>(a.x+=(a.a==(a.a=x.rel?x.cmd:x.cmd.toUpperCase())?',':a.a)+x.dat.map((y,z)=>(z=(''+y).match(/\.(\d*[09]{6,})/),z?+y.toFixed(z[1].length-1):y)),a),{a:0,x:''}).x;}
};