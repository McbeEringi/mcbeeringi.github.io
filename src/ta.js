const TA={
	brkt:['()','{}','[]'],quot:[...'\'"`'],
	ah:x=>Object.assign(x.style,{boxSizing:'border-box',overflow:'hidden',height:''}).height=x.offsetHeight+x.scrollHeight-x.clientHeight+'px',
	sizer:x=>{TA.ah(x);x.addEventListener('input',()=>TA.ah(x));},
	editor:x=>{TA.sizer(x);x.addEventListener('keydown',e=>{
		const S=x.selectionStart,E=x.selectionEnd,cs=(y,z=(()=>{e.preventDefault();return y;})())=>{x.selectionStart=y;x.selectionEnd=z;},
			ins=(y,z=1)=>{x.value=x.value.slice(0,S)+y+x.value.slice(E);cs(S+z);},del=()=>{if(S==E&&(TA.brkt.includes(x.value.slice(S-1,S+1))||(x.value[S-1]==x.value[S]&&TA.quot.includes(x.value[S]))))cs(S-1,E+1);};
		(({
			Tab:()=>ins('	'),Backspace:del,Delete:del,Enter:()=>{const s=x.value.slice(0,S).match(/([	 ]*).*$/)[1]+(TA.brkt.some(y=>x.value[S-1]==y[0])?'	':'');ins('\n'+s,s.length+1);},
			...Object.fromEntries(TA.brkt.map(y=>[[y[0],()=>ins(y[0]+x.value.slice(S,E)+y[1])],[y[1],()=>{if(x.value[S]==y[1])cs(S+1);}]]).flat()),
			...Object.fromEntries(TA.quot.map(y=>[y,()=>{if(x.value[S]==y)cs(S+1);else ins(y+x.value.slice(S,E)+y)}])),
		})[e.key]||Array)();
		if(e.defaultPrevented)TA.ah(x);
	});}
};