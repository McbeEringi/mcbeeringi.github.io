const
uuidgen=self.crypto.randomUUID?(_=>self.crypto.randomUUID()):(w=>(w=[...self.crypto.getRandomValues(new Uint8Array(16))].flatMap(x=>[x>>4,x&0xf]),Array.from('00000000-0000-4000-1000-000000000000',x=>([_=>w.pop().toString(16),_=>'89ab'[w.pop()%4]][x]||(_=>x))()).join(''))),
mcmf=({n:name='',d:description='',t:type='resources',v:version=[0,0,1],m}={})=>JSON.stringify({format_version:m&&+m.join('')>=1130?2:1,header:{name,description,version,...(m?{min_engine_version:m}:{}),uuid:uuidgen()},modules:[{type,version,uuid:uuidgen()}]});
