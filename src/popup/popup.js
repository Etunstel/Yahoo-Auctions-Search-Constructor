

//var console = chrome.extension.getBackgroundPage().console;
var dictionary;
var favorites;
var popup = {

	init: function () {

		document.addEventListener("DOMContentLoaded", function () {

		var searchList  = document.getElementById("searches-outer");

		loadFavorites(searchList, populateSearchList);
		console.log

		});
	}

}

function isEmpty(obj) {
	for(key in obj) {
		if(obj.hasOwnProperty(key)){
			return false;
		}

	}
	return true;
}



function copyToClipboard(str) {
	var tmp = document.createElement("textarea");
 	tmp.value = str;
 	document.body.appendChild(tmp);
  	tmp.select();
  	document.execCommand('copy');
  	document.body.removeChild(tmp);
}


function addListItem(list, searchName) {
	var li =document.createElement("div");
	var copiedMsg = document.createElement("span");
	copiedMsg.innerText = "Copied to clipboard!";
	li.innerText = searchName;
	li.classList.add("favorite-search");
	li.classList.add("tooltip");

	copiedMsg.classList.add("tooltip-text");
	li.appendChild(copiedMsg);

	li.addEventListener("click", function() {
		copyToClipboard(favorites.searches[searchName]);
		copiedMsg.style.visibility = "visible";
	});

	copiedMsg.addEventListener("transitionend", function(event) {
  			copiedMsg.style.visibility = "hidden";
		}, false);

	list.appendChild(li);
}

function addPlaceholder(list){
	var placeholder = document.createElement("div");

	placeholder.classList.add("favorite-search");
	placeholder.classList.add("placeholder");
	placeholder.innerText = "No saved searches!";

	list.appendChild(placeholder);


}



function populateSearchList(list, favorites) {
	 if(isEmpty(favorites.searches)) {
	 	addPlaceholder(list);
 	 } else {
	  var names = Object.keys(favorites.searches);
	  names.sort();
	  names.forEach(function(key,index) {


		addListItem(list, key);
	 });
  	}
}


function loadFavorites(list, callback) {
  chrome.runtime.sendMessage({fn: "getFavoriteSearches"}, function(response){

	favorites = response;
	callback(list, response);

  });
}

popup.init();