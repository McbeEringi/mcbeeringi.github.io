document.body.insertAdjacentHTML('beforeend',`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css">
<style>
	.swiper{width:90%;margin:0 auto;}.swiper-slide{object-fit:contain;}
</style>`);
fetch('https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js').then(x=>x.text()).then(x=>{
	new Function(x)();
	const swi=()=>new Swiper('.swiper',{
		slidesPerView:1,spaceBetween:30,loop:true,centeredSlides:true,
		breakpoints:{600:{slidesPerView:2}},
		autoplay:{delay:2500,disableOnInteraction:false,},
		pagination:{el:'.swiper-pagination',clickable:true},
		navigation:{nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'}
	});
	/*if(document.readyState=='loading')window.addEventListener('DOMContentLoaded',swi,{once:true});else */swi();
});
