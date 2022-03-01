hsv=(h=0,s=1,v=1)=>[5,3,1].map(i=>((k=(h*6+i)%6)=>v-Math.max(0,Math.min(1,k,4-k))*s*v)()),
rgb=(r=0,g=0,b=0)=>((v=Math.max(r,g,b),c=v-Math.min(r,g,b))=>[c&&((v==r?(g-b)/c:v==g?2+(b-r)/c:4+(r-g)/c)/6+1)%1,v&&c/v,v])(),
mix=(...s)=>s.reduce((a,x)=>a.map((y,i)=>y+1-x[i]),[0,0,0]).map(x=>1-x/s.length),
dec=s=>new Array(3).fill().map((_,i)=>parseInt(s.slice(1+i*2,3+i*2),16)/255),
hex=s=>'#'+s.map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');