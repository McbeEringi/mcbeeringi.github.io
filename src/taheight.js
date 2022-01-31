const taheight=x=>Object.assign(x.style,{boxSizing:'border-box',overflow:'hidden',height:''}).height=x.offsetHeight+x.scrollHeight-x.clientHeight+'px',
tainit=(...x)=>x.forEach(y=>{taheight(y);y.addEventListener('input',()=>taheight(y));});
