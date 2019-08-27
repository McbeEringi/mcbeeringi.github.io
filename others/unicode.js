function decode() {
	var str = document.getElementById("input").value;
	str = str.replace(/\\/g, '%');
	document.getElementById("out").value = unescape(str);
}

function encode() {
	var str = escape(document.getElementById("input").value);
	str = str.replace(/%/g, '\\');
	document.getElementById("out").value = str;
}
//https://qiita.com/simiraaaa/items/2e7478d72f365aa48356
function execCopy(string) {
	// 空div 生成
	var tmp = document.createElement("div");
	// 選択用のタグ生成
	var pre = document.createElement('pre');
	// 親要素のCSSで user-select: none だとコピーできないので書き換える
	pre.style.webkitUserSelect = 'auto';
	pre.style.userSelect = 'auto';
	tmp.appendChild(pre).textContent = string;
	// 要素を画面外へ
	var s = tmp.style;
	s.position = 'fixed';
	s.right = '200%';
	// body に追加
	document.body.appendChild(tmp);
	// 要素を選択
	document.getSelection().selectAllChildren(tmp);
	// クリップボードにコピー
	var result = document.execCommand("copy");
	// 要素削除
	document.body.removeChild(tmp);
	return result;
}

function clipboard() {
	if (execCopy(document.getElementById("out").value)) {
		document.getElementById("clip_button").innerHTML = "copied";
	} else {
		document.getElementById("clip_button").innerHTML = "copy failed";
	}
	setTimeout(function() {
		document.getElementById("clip_button").innerHTML = "copy to clipboard";
	}, 1000);
}
