const
uuidgen=self.crypto&&self.crypto.randomUUID?(_=>self.crypto.randomUUID()):(_=>Array.from('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',x=>({x:_=>(Math.random()*16|0).toString(16),y:_=>'89ab'[Math.random()*4|0]}[x]||(_=>x))()).join('')),
mcmf=({n:name='',d:description='',t:type='resources',v:version=[0,0,1],m}={})=>JSON.stringify({
	format_version:m&&+m.join('')>=1130?2:1,
	header:{name,description,version,...(m?{min_engine_version:m}:{}),uuid:uuidgen()},
	modules:[{type,version,uuid:uuidgen()}]
});
