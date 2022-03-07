window.FloatPR={
	name:'float-pixelRatio',version:'0.1.0',for:'matter-js@*',
	install(base){base.after('Mouse.create',function(){this.pixelRatio=+this.element.getAttribute('data-pixel-ratio')||1;});}
};Matter.Plugin.register(FloatPR);