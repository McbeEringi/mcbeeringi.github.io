window.Spriter={
	name:'spriter',version:'0.1.0',for:'matter-js@*',
	install(base){base.after('Render.bodies',function(){
		const r=arguments[0];
		Object.keys(r.textures).forEach(i=>{
			if(!Spriter.textures[i]){Spriter.textures[i]={apply(c){r.textures[i]=c;},img:r.textures[i]};Spriter.exeMod(i);}
		});
	});},
	textures:{},mods:{},
	stdMod:(ctx,img)=>ctx.drawImage(img,0,0),
	setMod(i,fx){Spriter.mods[i]=fx;Spriter.exeMod(i);},
	exeMod(i){
		Spriter.textures[i].img.onload=()=>{
			const {width,height}=Spriter.textures[i].img,
				c=Object.assign(document.createElement('canvas'),{width,height});
			(Spriter.mods[i]||Spriter.stdMod)(c.getContext('2d'),Spriter.textures[i].img);
			Spriter.textures[i].apply(c);
		};
		if(Spriter.textures[i].img.complete)Spriter.textures[i].img.onload();
	}
};Matter.Plugin.register(Spriter);