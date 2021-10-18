//https://github.com/Jam3/audiobuffer-to-wav
const toWav=x=>{
	let ch=x.numberOfChannels,rate=x.sampleRate;
	if(ch==1)x=x.getChannelData(0);else{const l=x.getChannelData(0),r=x.getChannelData(1);x=new Float32Array(l.length+r.length);for(let i=0;i<x.length;i++){x[i*2]=l[i];x[i*2+1]=r[i];}};
	const b=new ArrayBuffer(44+x.length*2),v=new DataView(b),str=(c,s)=>{for(let i=0;i<s.length;i++)v.setUint8(c+i,s.charCodeAt(i))};
	str(0,'RIFF');v.setUint32(4,36+x.length*2,true);str(8,'WAVE');
	str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,ch,true);v.setUint32(24,rate,true);ch*=2;v.setUint32(28,rate*ch,true);v.setUint16(32,ch,true);v.setUint16(34,16,true);
	str(36, 'data');v.setUint32(40,x.length*2,true);for(let i=0;i<x.length;i++){const s=Math.max(-1,Math.min(1,x[i]));v.setInt16(44+i*2,s<0?s*0x8000:s*0x7FFF,true);}
	return b;
};
