/*
	SPEC
		Spriter.textures: Array
			texture cache
		Spriter.mods: Array
			modifier cache
		Spriter.stdMod: Function((ctx,img)=>ctx.drawImage(img,0,0)) => void
			default texture modifier
			see also Spriter.setMod
				ctx: CanvasRenderingContext2D
					canvas(as texture) 2d context
				img: HTMLImageElement
					original image element
		Spriter.exeMod: Function((url)=>{}) => void
			execute modification
			use Spriter.setMod for general usage
				url: String
					texture url
		Spriter.setMod: Function((url,mod)=>{}) => void
			set modifier and refresh texture.
				url: String
					texture url
				mod: Function((ctx,img)=>{}) => void
					texture modifier
						ctx: CanvasRenderingContext2D
							canvas(as texture) 2d context
						img: HTMLImageElement
							original image element
	USAGE
		cut circle
			Spriter.stdMod=(ctx,img)=>{ctx.beginPath();ctx.ellipse(img.width/2,img.height/2,img.width/2,img.height/2,0,0, 2*Math.PI);ctx.clip();ctx.drawImage(img,0,0);};
*/

const Spriter={
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