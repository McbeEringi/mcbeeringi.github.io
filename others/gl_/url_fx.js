function url_i(){
	// https://qiita.com/tonkatu_tanaka/items/99d167ded9330dbc4019
	var pair=location.search.substring(1);
	if(pair){
		pair = pair.split("&");
		var arg = new Object;
		for(var i=0;pair[i];i++) {
			var kv = pair[i].split("=");
			arg[kv[0]]=kv[1];
		}
		console.log(arg);
		if(arg.vsh)vsh.setValue(unescape(zip_inflate(atob(arg.vsh.replace(/-/g,"+").replace(/_/g,"/")))),-1);
		if(arg.fsh)fsh.setValue(unescape(zip_inflate(atob(arg.fsh.replace(/-/g,"+").replace(/_/g,"/")))),-1);
		if(arg.fps)document.getElementById("fps").value=arg.fps;
		if(arg.c_c)document.getElementById("c_c").value=arg.c_c.replace(/,/g,", ");
		if(arg.c_rot)document.getElementById("c_rot").value=arg.c_rot.replace(/,/g,", ");
		if(arg.c_os)document.getElementById("c_os").value=arg.c_os.replace(/,/g,", ");
		if(arg.model){var model = document.getElementById("model").model;model[0].checked=false;model[arg.model].checked=true;}
		if(arg.stuff)document.getElementById("stuff").style.display=arg.stuff;
	}
}
function url_e(e_ifl){
	var e_fps = document.getElementById("fps").value;
	if(e_ifl && e_fps>30)e_fps = 30;
	var e_c_c = document.getElementById("c_c").value.replace(/\s+/g,"");
	var e_c_rot = document.getElementById("c_rot").value.replace(/\s+/g,"");
	var e_c_os = document.getElementById("c_os").value.replace(/\s+/g,"");
	var e_model = document.getElementById("model").model.value;
	var url = location.href.replace(/\?.*$/,"")
		+"?vsh="+btoa(zip_deflate(escape(vsh.getValue()))).replace(/\+/g,"-").replace(/\//g,"_")
		+"&fsh="+btoa(zip_deflate(escape(fsh.getValue()))).replace(/\+/g,"-").replace(/\//g,"_");
	if(e_fps!=60)url += "&fps="+e_fps;
	if(e_c_c!="1.0,1.0,1.0,1.0")url += "&c_c="+e_c_c;
	if(e_c_rot!="0.5,0.5*TIME,0.0")url += "&c_rot="+e_c_rot;
	if(e_c_os!="0.0,0.0,5.0")url += "&c_os="+e_c_os;
	if(e_model!=0)url += "&model="+e_model;
	if(e_ifl)url = "<iframe style='width:1600;height:900' class='gl' src='"+url+"&stuff=none'>";//iflame用
	return url;
}
function url_copy(ifl){
	var disp = document.getElementById("url");
	if (execCopy(url_e(ifl)))disp.innerHTML = "copied!";
	setTimeout(function(){disp.innerHTML = "copy url";}, 1000);
}
//https://qiita.com/simiraaaa/items/2e7478d72f365aa48356
function execCopy(string) {
	var tmp = document.createElement("div");//空div 生成
	var pre = document.createElement("pre");//選択用のタグ生成
	pre.style.webkitUserSelect = "auto";//親要素のCSSでuser-select:noneだとコピーできないので書き換える
	pre.style.userSelect = "auto";
	tmp.appendChild(pre).textContent = string;
	var s = tmp.style;//要素を画面外へ
	s.position = "fixed";
	s.right = "200%";
	document.body.appendChild(tmp);//bodyに追加
	document.getSelection().selectAllChildren(tmp);//要素を選択
	var result = document.execCommand("copy");//クリップボードにコピー
	document.body.removeChild(tmp);//要素削除
	return result;
}
