const TA={
	brkt:['()','{}','[]','「」','『』'],quot:[...'\'"`'],
	ah:x=>Object.assign(x.style,{boxSizing:'border-box',height:''}).height=x.offsetHeight+x.scrollHeight-x.clientHeight+'px',
	sizer:x=>{TA.ah(x);x.addEventListener('input',()=>TA.ah(x));},
	editor:x=>{TA.sizer(x);x.addEventListener('keydown',e=>{if(!e.isComposing){
		const S=x.selectionStart,E=x.selectionEnd,pd=()=>e.preventDefault(),cs=(y,z=y)=>{x.selectionStart=y;x.selectionEnd=z;},
			ins=y=>{x.value=x.value.slice(0,S)+y+x.value.slice(E);},del=()=>{if(S==E&&(TA.brkt.includes(x.value.slice(S-1,S+1))||(x.value[S-1]==x.value[S]&&TA.quot.includes(x.value[S]))))cs(S-1,E+1);};
		(({
			Tab:()=>{pd();ins('	');cs(S+1);},Backspace:del,Delete:del,Enter:()=>{pd();const s='\n'+x.value.slice(0,S).match(/([	 ]*).*$/)[1]+(TA.brkt.some(y=>x.value[S-1]==y[0])?'	':'');ins(s);cs(S+s.length);},
			...Object.fromEntries([
				...TA.brkt.map(y=>[[y[0],()=>cs(S,ins(x.value.slice(S,E)+y[1]))],[y[1],()=>{if(x.value[S]==y[1])cs(S+1,pd());}]]).flat(),
				...TA.quot.map(y=>[y,()=>{if(x.value[S]==y)cs(S+1,pd());if(x.value[S-1]!=y)cs(S,ins(x.value.slice(S,E)+y));}])
			])
		})[e.key]||Array)();
		if(e.defaultPrevented)TA.ah(x);
	}});}
};
