

//var console = chrome.extension.getBackgroundPage().console;
var dictionary;
var favorites;
var popup = {

	init: function () {

		document.addEventListener("DOMContentLoaded", function () {

		var searchList  = document.getElementById("searches-outer");

		loadFavorites(searchList, populateSearchList);

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


function deleteFavoriteSearch(searchName) {

	chrome.runtime.sendMessage({fn:"removeFavoriteSearch", "name": searchName }, function(response){
		console.log(response);
	});

	delete favorites.searches[searchName];

}


function copyToClipboard(str) {
	var tmp = document.createElement("textarea");
 	tmp.value = str;
 	document.body.appendChild(tmp);
  	tmp.select();
  	document.execCommand('copy');
  	document.body.removeChild(tmp);
}



function deleteListItem(list, li) {


	list.removeChild(li);
	console.log(list.childNodes);
	if(isEmpty(favorites.searches))
		addPlaceholder(list);

}


function addListItem(list, searchName) {
	var li =document.createElement("div");
	var copiedMsg = document.createElement("span");
	var deleteButton = document.createElement("div");

	copiedMsg.innerText = "Copied to clipboard!";
	li.innerText = searchName;
	li.classList.add("favorite-search");
	li.classList.add("tooltip");

	copiedMsg.classList.add("tooltip-text");
	li.appendChild(copiedMsg);

	deleteButton.classList.add("delete-button");
	deleteButton.innerHTML = "\u2a2f";
	li.appendChild(deleteButton);

	li.addEventListener("click", function() {
		copyToClipboard(favorites.searches[searchName]);
		copiedMsg.style.visibility = "visible";
	});

	deleteButton.addEventListener("click", function(){
		deleteFavoriteSearch(searchName);
		deleteListItem(list, this.parentNode);
	})

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