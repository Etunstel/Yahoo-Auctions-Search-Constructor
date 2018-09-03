


/* dictionary {
	title: ""
/   keywords: [
		"guitar strings": [ギター弦],
		sweater: [セーター,ニット]
		...
	]
}
*/


function Dictionary(title) {
		this.title = title;
		this.keywords = {};
}

var background = {


	addKeyword : function(request, sender, sendResponse) {

		if(dictionary.keywords[request.englishName] === undefined) {
			dictionary.keywords[request.englishName] = request.translations;
			this.saveDictionary({dict: dictionary});
			sendResponse("Keyword updated");
		} else {
			temp = dictionary.keywords[request.englishName];
			for(var i in request.translations) {
				if(!temp.includes(request.translations[i])) temp.unshift(request.translations[i].toLowerCase());
			}
			dictionary.keywords[request.englishName] = temp;
			this.saveDictionary({dict: dictionary});
			sendResponse("Keyword modified");
		}
	},

	removeKeyword: function(request, sender, sendResponse) {
		if(dictionary.keywords[request.englishName] === undefined) {
			sendResponse("Keyword does not exist");
		} else {
			delete dictionary.keywords[request.englishName];
			this.saveDictionary({dict: dictionary});
			sendResponse("Keyword removed");
		}
	},

	updateKeyword:  function(request, sender, sendResponse) {

		if(!dictionary.keywords[request.englishName]) {
			sendResponse("This keyword does not exist");
		} else {
			dictionary.keywords[request.englishName] = request.translations;
			saveDictionary({dict: dictionary});
		}
	},

	saveDictionary : function(request, sender, sendResponse) {
		chrome.storage.sync.set({"mainDictionary": request.dict}, function() {
			console.log("Dictionary Saved ");
		});
	},

	loadDictionary : function() {
		chrome.storage.sync.get(["mainDictionary"], function(result) {

		test = result["mainDictionary"];
		if(!test || typeof test === undefined) {
			setDictionary(new Dictionary("Main Dictionary"));
		}
		else {
			console.log("Dictionary loaded:");
			setDictionary(test);
		}
		});
	},

	getDictionary: function(request, sender, sendResponse) {
		sendResponse(dictionary);
	},


	translate: function(request, sender, sendResponse) {
		var s = request.query;

		var transl = translateQuery(s);
		sendResponse("Translation: " + transl);
	},


	init: function() {


		this.loadDictionary();

		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

			console.log("Message recieved", request);
			if(request.fn in background) {
				background[request.fn](request, sender, sendResponse);
				return true;
			}

  		});
	},
};




function setDictionary(dict) {
	dictionary = dict;
};


function translateQuery(query) {
	var s = "";
	for (var q in query) {
		if(dictionary.keywords[query[q]] === undefined){
			console.log("'" + query[q] + "' is not in dict")
			s = s + query[q] + " ";
		} else {
			s = s + dictionary.keywords[query[q]] + " ";
		}
	}

	return s;
}


var dictionary;

//chrome.storage.sync.remove("mainDictionary");

background.init();