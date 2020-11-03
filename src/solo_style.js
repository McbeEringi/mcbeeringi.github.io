document.body.insertAdjacentHTML('beforeend',`
	<link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css">
	<style>
		.swiper-container{width:90%;height:auto;}.swiper-container img{width:100%;}
		.box{display:flex;flex-wrap:wrap;}.box>*{flex-grow:1;width:300px;}
	</style>
`);
window.addEventListener('load',()=>{
	fetch('https://unpkg.com/swiper/swiper-bundle.min.js').then(r=>r.text()).then(t=>{
		eval(t);
		var swiper=new Swiper('.swiper-container',{
			slidesPerView:1,spaceBetween:0,loop:true,centeredSlides:true,
			breakpoints:{
				600:{slidesPerView:2,spaceBetween:30}
			},
			autoplay:{delay:2700,disableOnInteraction:false,},
			pagination:{el:'.swiper-pagination',clickable:true},
			navigation:{nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'}
		});
		console.log(swiper);
	});
});
