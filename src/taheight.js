const taheight=x=>{Object.assign(x.style,{boxSizing:'border-box',height:''});x.style.height=`${x.offsetHeight+x.scrollHeight-x.clientHeight}px`;},
tainit=(...x)=>x.forEach(y=>{taheight(y);y.addEventListener('input',()=>taheight(y));});
