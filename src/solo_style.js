fetch('https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js').then(r=>r.text()).then(t=>{
	Function(t)();
	const setsolo=()=>{
		document.body.insertAdjacentHTML('beforeend',`
			<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css" media="print" onload="this.media='all'">
			<style>
				.swiper-container{overflow:hidden;width:90%;height:auto;}.swiper-container img{width:100%;}
			</style>
		`);
		document.querySelectorAll('.swiper-slide').forEach(x=>{
			if(x.dataset.img){
				let img=document.createElement('img');
				img.src=x.dataset.img;
				x.appendChild(img);
			}
		});
		console.log(
			new Swiper('.swiper-container',{
				slidesPerView:1,spaceBetween:0,loop:true,centeredSlides:true,
				breakpoints:{
					600:{slidesPerView:2,spaceBetween:30}
				},
				autoplay:{delay:2500,disableOnInteraction:false,},
				pagination:{el:'.swiper-pagination',clickable:true},
				navigation:{nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'}
			})
		);
	};
	if(document.readyState=='loading')window.addEventListener('DOMContentLoaded',setsolo,{once:true});else setsolo();
});
