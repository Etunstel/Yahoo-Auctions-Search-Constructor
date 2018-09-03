

var console = chrome.extension.getBackgroundPage().console;
var dictionary;
var popup = {

	init: function () {

		document.addEventListener("DOMContentLoaded", function () {

		var f = document.getElementById("form1");
		var addButton = document.getElementById("addButton");
		var getButton = document.getElementById("getButton");
		var translateButton = document.getElementById("transButton");
		var deleteButton = document.getElementById("deleteButton");

		addButton.addEventListener("click", function() {
			addKeyword();
		});

		getButton.addEventListener("click", function() {
			reloadDictionary();
		});

		deleteButton.addEventListener("click", function() {
			deleteKeyword();
		});

		translateButton.addEventListener("click", function() {
			translateQuery();
		})


		});
	}

}

function translateQuery() {
	var q = document.getElementById("qbox").value.toLowerCase();
	chrome.runtime.sendMessage({fn: "translate",  query: q.split(" ")}, function(response){
		console.log("Got a response: ", response);
	});
}

function deleteKeyword() {
	var eName = document.getElementById("deletename").value.toLowerCase().trim();
	if(eName === "") {
		return;
	}

	chrome.runtime.sendMessage({fn: "removeKeyword",  englishName: eName}, function(response){
		console.log("Got a response: ", response);
	});

	reloadDictionary();

}



function addKeyword() {
	var eName = document.getElementById("ename").value.toLowerCase().trim();


	var d = document.getElementById("jwords");


	var transl = d.value.split(" ");
	console.log(transl)

	if(eName === "") {
		alert("Enter a valid english name!")
		return;
	} else if (transl[0] == "") {
		alert("Enter one or more keywords!")
		return;
	}

	chrome.runtime.sendMessage({fn: "addKeyword",  englishName: eName, translations: transl}, function(response){
		console.log("Got a response: ", response);
	});

	reloadDictionary();

}

function reloadDictionary() {
	chrome.runtime.sendMessage({fn: "getDictionary"}, function(response){
		var dictPrint = document.getElementById("dictionaryPrint");
		dictionaryPrint.innerHTML = JSON.stringify(response);
		console.log("Got a response: ", response);
		dictionary = response;
	});
}



popup.init();

