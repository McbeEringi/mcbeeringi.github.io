const midi2json=async w=>{
	w=new DataView(await new Response(w).arrayBuffer());
	if(w.getUint32(0)!==0x4d546864)throw'invaild file.';
	let p=8+w.getUint32(4),tracks=[];
	while(p<w.byteLength){
		let q=p+8,s=[],
				vln=(x,y)=>{while(1){y=w.getUint8(q++);x=(x<<7)|(y&0x7f);if(!(y>>7))break;}return x;},
				ui7=()=>w.getUint8(q++)&0x7f,
				ui7s=(x,...y)=>Object.assign(x,Object.fromEntries(y.map(z=>[z,ui7()])));
		if(w.getUint32(p)!==0x4d54726b)throw'invailed chunk type.';
		p+=8+w.getUint32(p+4);
		if((w.getUint32(p-4)&0xffffff)!==0xff2f00)throw'invailed chunk length or end of chunk is not defined.';
		while(q<p){
			let dt=vln(),e=w.getUint8(q),ch=e&0x0f;
			if(e>>7)q++;else e=s[s.length-1].e;
			s.push({dt,...[//8~
				()=>ui7s({e,ch,name:'noteOff'},'note','vel'),
				()=>ui7s({e,ch,name:'noteOn'},'note','vel'),
				()=>ui7s({e,ch,name:'polyPress'},'note','vel'),
				()=>ui7s({e,ch,name:'ctrl'},'ctrl','value'),
				()=>ui7s({e,ch,name:'prg'},'prg'),
				()=>ui7s({e,ch,name:'chPress'},'vel'),
				()=>({e,ch,name:'bend',value:(ui7()|(ui7()<<7))-0x2000}),
				({
					0:(l=vln())=>({name:'sysEx0',data:new Uint8Array(0xf0,...new Uint8Array(w.buffer,q,q+=l))}),
					7:(l=vln())=>({name:'sysEx7',data:new Uint8Array(w.buffer.slice(q,q+=l))}),
					15:(type=ui7(),l=vln())=>({name:'meta',type,data:new Uint8Array(w.buffer.slice(q,q+=l))})
				}[ch])
			][(e>>4)&0b0111]()});
		}
		tracks.push(s);
	}
	return{header:{format:w.getUint16(8),length:w.getUint16(10),precision:w.getInt16(12)},tracks};
},
json2midi=w=>{
	let vln=x=>{let s=[];while(1){s.unshift((x&0x7f)|(s.length?0x80:0));x>>=7;if(!x)break;}return s;},
		num=(x,l)=>new Array(l--).fill().map((_,i)=>(x>>(8*(l-i)))&0xff);
	return new Blob([new Uint8Array([
		0x4d,0x54,0x68,0x64, 0,0,0,6,
		...num(w.header.format,2),
		...num(w.header.length||w.tracks.length,2),
		...num(w.header.precision,2),
		...w.tracks.flatMap(x=>{
			x=x.flatMap(y=>[
				...vln(y.dt),
				...({
					noteOff:()=>[0x80+(y.ch&0xf),y.note&0x7f,y.vel&0x7f],
					noteOn:()=>[0x90+(y.ch&0xf),y.note&0x7f,y.vel&0x7f],
					polyPress:()=>[0xa0+(y.ch&0xf),y.note&0x7f,y.vel&0x7f],
					ctrl:()=>[0xb0+(y.ch&0xf),y.ctrl&0x7f,y.value&0x7f],
					prg:()=>[0xc0+(y.ch&0xf),y.prg&0x7f],
					chPress:()=>[0xd0+(y.ch&0xf),y.vel&0x7f],
					bend:(z=y.value+0x2000)=>[0xe0+(y.ch&0xf),z&0x7f,(z>>7)&0x7f],
					sysEx0:()=>[0xf0,...vln(y.data.length-1),...y.data.slice(1)],
					sysEx7:()=>[0xf7,...vln(y.data.length),...y.data],
					meta:()=>[0xff,y.type&0x7f,...vln(y.data.length),...y.data]
				}[y.name]())
			]);
			return[0x4d,0x54,0x72,0x6b,...num(x.length,4),...x];
		})
	]).buffer]);
};

//json format
/*
{
	header:{
		format:Uint16,
		length:Uint16,
		precision:Int16
	},
	tracks:[
		[
			event(see l17~l27)
			...
		]
		...
	]
}
*/

//example
/*
midi2json(
	new Blob([new Uint8Array(`
		4d 54 68 64
		00 00 00 06
		00 01
		00 02
		00 30

		4d 54 72 6b
		00 00 00 2a
		00 ff 01 04 74 65 73 74
		00 ff 02 02 43 52
		00 ff 03 05 74 69 74 6c 65
		00 ff 51 03 07 a1 20
		00 ff 58 04 04 02 18 08
		00 ff 2f 00

		4d 54 72 6b
		00 00 00 17
		00 90 3c 7f
		30    3c 00
		00    3e 7f
		30    3e 00
		00    40 7f
		60    40 00
		00 ff 2f 00
	`.match(/[\da-f]{2}/g).map(x=>parseInt(x,16))).buffer])
).then(json2midi).then(midi2json).then(console.log);
*/