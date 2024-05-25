const
uuidgen=self.crypto.randomUUID?(_=>self.crypto.randomUUID()):(w=>(w=[...self.crypto.getRandomValues(new Uint8Array(16))].flatMap(x=>[x>>4,x&0xf]),Array.from('00000000-0000-4000-1000-000000000000',x=>([_=>w.pop().toString(16),_=>'89ab'[w.pop()%4]][x]||(_=>x))()).join(''))),
mcmf=({n='',d='',t='resources',v=[0,0,1],m=[1,13,0]}={})=>JSON.stringify({format_version:2,header:{name:n,description:d,version:v,min_engine_version:m,uuid:uuidgen()},modules:[{type:t,version:v,uuid:uuidgen()}]});

export{uuidgen,mcmf};