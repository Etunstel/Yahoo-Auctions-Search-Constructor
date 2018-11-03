
KANJIKANA_REGEX = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g;



	chrome.runtime.onMessage.addListener(function(message){
		if(message.command== "translate-search"){
			translateSearch();
		}
	});


	function translateSearch(){
		var searchBar = document.getElementById("yschsp");
		var search = searchBar.value;

		if(!searchBar.value || 0 === searchBar.value.length) return;

		if(KANJIKANA_REGEX.test(search)){

			alert("Remove any kanji/kana before attempting to translate!")
			return;
		}

		chrome.runtime.sendMessage({fn: "translate",  query: searchBar.value.toLowerCase()}, function(response) {
			searchBar.select();
			document.execCommand("insertText", false, response);
		});

	}