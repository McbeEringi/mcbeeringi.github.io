document.write('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300&family=M+PLUS+Rounded+1c&display=swap" rel="stylesheet" />');
document.write('<link rel="stylesheet" href="sky_style.css" rel="stylesheet" />');
const e_bg =  document.createElement('div');
e_bg.setAttribute('id','bg');
document.body.appendChild(e_bg);
const bgcol = [
	[4,1,2,2,3,4][Math.floor(Math.max(new Date().getHours()-1,0)*.25)],
	"#fff1cf,#ced980",//morn
	"#cce5f0,#ced980",//day
	"#f08300,#f8b862",//dusk
	"#192f60,#274a78"//night
];
bg.style.background = "linear-gradient("+bgcol[bgcol[0]]+")";
