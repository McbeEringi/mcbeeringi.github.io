const taheight=x=>{Object.assign(x.style,{overflow:'hidden',wordWrap:'break-word',height:''});x.style.height=`${x.scrollHeight}px`;},
tainit=(...x)=>x.forEach(y=>{taheight(y);y.addEventListener('input',()=>taheight(y));});
