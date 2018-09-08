

var KEYTAG_REGEX = /(^[^"':;\s]+$|^"[^"':;\s]+(?:\s+[^"':;\s]+)+")/;

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
		var clearButton = document.getElementById("clearButton");

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

		clearButton.addEventListener("click", function() {
			clearDictionary();
		})

		});
	}

}

function translateQuery() {
	var q = document.getElementById("qbox").value.toLowerCase().trim();
	chrome.runtime.sendMessage({fn: "translate",  query: q}, function(response){
		alert(response);
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

// If the entire line of keywords is properly formatted, returns a list of
// all keywords in the line. Returns an empty list if the line is invalid.
function getKeywordsIfValid(line){
    var quotesSplit = line.split("\"");
    console.log(quotesSplit);
    var validKeywords = [];
    for (var i = 0; i < quotesSplit.length; i++) {
      	 if ((i % 2) == 0) {  //even entries contain space-separated single keywords
        	 if(!(quotesSplit[i] === "")) {

             	var singleWords = quotesSplit[i].replace(/\s{2,}/g, " "); //replace multi spaces
        		singleWords = singleWords.split(" ");
           		 for (var j in singleWords){
           		 	if(singleWords[j] != "") {
           		 	  if(  !singleWords[j].match(KEYTAG_REGEX)) {
            			//console.log("single keyword match fail");
            			return []; //invalid single keyword
            		}
                	validKeywords.push(singleWords[j]);
           		 	}
           		 }
           }
        } else {//odd

        		var noMultis = quotesSplit[i].replace(/\s{2,}/g, " ");
        		var singleWords = noMultis.split(" ");

           		 for (var j in singleWords){
            		if(!singleWords[j].match(KEYTAG_REGEX)){
            			//console.log("Multikeyword match fail");
            			return [];
            		}
           		 }

        	if(!(quotesSplit[i] === ""))
        		validKeywords.push(noMultis);
        }
    }
    return validKeywords;
}



function addKeyword() {
	console.log("hi");
	var eName = document.getElementById("ename").value.toLowerCase().trim();

	var input = document.getElementById("jwords").value.toLowerCase().trim();

	var transl = getKeywordsIfValid(input);
	console.log(transl);

	if(!eName.match(KEYTAG_REGEX)) {
		alert("Enter a valid english name!")
		return;
	} else if (transl === []) {
		alert("Enter one or more valid keywords!")
		return;
	}
	ename = eName.replace(/["]/g, "");
	console.log("about to add")
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

function clearDictionary() {
	chrome.runtime.sendMessage({fn: "clearDictionary"}, function(response){
		console.log("Got a response: ", response);
	});
}




popup.init();

