
// matches queries composed of a series of "AND" and "OR" searches
QUERY_REGEX = /(\([^\)\(]+\s[^\)\(]+\)|(?:[^\)\(\s]+\s?)+)/g

// matches only OR searches: (keyword1 keyword2 keyword3)
OR_SEARCH_REGEX = /\([^\)\(]+\s[^\)\(]+\)/;

// matches only ND searches: keyword1 keyword2 keyword3
//AND_SEARCH_REGEX = /(?:[^\)\(\s]+\s?)+/;

var SPACED_KEYWORD_REGEX = /^(^"[^"':;\s]+(?:\s+[^"':;\s]+)+")$/;
var ENGLISH_REGEX = /^(^[^"':;\s]+(?:\s+[^"':;\s]+)*)$/;

function Dictionary(title) {
		this.title = title;
		this.keywords = {};
}

function SearchList(name){
	this.name = name;
	this.searches = {};
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
			dictionary = request.dict;
			//console.log("Dictionary Saved.");
		});
	},

	saveFavoriteSearches: function(request, sender, sendResponse) {
		chrome.storage.sync.set({"favoriteSearches": request.searches}, function() {
			favoriteSearches = request.searches;
			//console.log("Searches Saved.");
		});
	},

	loadDictionary : function() {
		chrome.storage.sync.get(["mainDictionary"], function(result) {

		test = result["mainDictionary"];
		if(!test || typeof test === undefined) {
			setDictionary(new Dictionary("Main Dictionary"));
		}
		else {
			//console.log("Dictionary loaded.");
			setDictionary(test);
		}
		});
	},

	addFavoriteSearch: function(request, sender, sendResponse) {
		favoriteSearches.searches[request.name] = request.query;
		this.saveFavoriteSearches({searches: favoriteSearches});
		sendResponse("Search added/updated.");
	},

	removeFavoriteSearch: function(request, sender, sendResponse) {
		if(favoriteSearches.searches[request.name] === undefined) {
			sendResponse("Favorite search does not exist");
		} else {
			delete favoriteSearches.searches[request.name];
			this.saveFavoriteSearches({searches: favoriteSearches});
			sendResponse("Search removed");
		}
	},

	loadFavoriteSearches: function() {
		chrome.storage.sync.get(["favoriteSearches"], function(result) {
		test = result["favoriteSearches"]
		if(!test || typeof test === undefined) {
			setFavoriteSearches(new SearchList("Favorite Searches"));
		}
		else {
			//console.log("Saved Searches loaded.");
			setFavoriteSearches(test);
		}
		});
	},

	getDictionary: function(request, sender, sendResponse) {
		sendResponse(dictionary);
	},

	clearDictionary: function(request, sender, sendResponse) {
		var d = new Dictionary("Main Dictionary");
		dictionary = d;
		this.saveDictionary({dict:dictionary});
		sendResponse("Dictionary removed")
	},

	getFavoriteSearches: function(request, sender, sendResponse) {
		sendResponse(favoriteSearches);
	},

	clearFavoriteSearches: function(request, sender, sendResponse) {
		var newFavorites = new SearchList("Favorite Searches");
		favoriteSearches = newFavorites;
		this.saveFavoriteSearches({searches:favoriteSearches});
		sendResponse("Searches cleared")
	},


	translate: function(request, sender, sendResponse) {
		var s = request.query;

		var translation = translateQuery(s);
		sendResponse(translation);
	},


	init: function() {


		this.loadDictionary();

		this.loadFavoriteSearches();

		createContextMenus();

		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

			if(request.fn in background) {
				background[request.fn](request, sender, sendResponse);
				return true;
			}

		});

		chrome.commands.onCommand.addListener(function(command){
			if(command == "translate-search"){

				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

					chrome.tabs.sendMessage(tabs[0].id, {command: command});

				});
			}
		});

	},
};

function menuOpenOptions(){
	if (chrome.runtime.openOptionsPage) {
	chrome.runtime.openOptionsPage();
  } else {
	window.open(chrome.runtime.getURL('options.html'));
  }
}


function menuAddTranslation() {

	do{
		keywordName = window.prompt("Add selection as translation for: ");
	} while(keywordName != null && !keywordName.trim().match(ENGLISH_REGEX)
								&& !keywordName.trim().match(SPACED_KEYWORD_REGEX))
	if(keywordName == null) return;

	chrome.tabs.executeScript( {
    	code: "window.getSelection().toString();"
	}, function(selection) {
		var selectedText = selection[0];
		background.addKeyword({englishName:keywordName, translations: [selectedText]}, null, function(response){
			console.log("Got a response: ", response);
		});
	});
}


function menuAddKeyword(){

	chrome.tabs.executeScript( {
    	code: "window.getSelection().toString();"
	}, function(selection) {
		var selectedText = selection[0];
		background.addKeyword({englishName: selectedText, translations: []}, null, function(response){
			console.log("Got a response: ", response);
		});
	});
}

function menuAddSearch() {

	do{
		searchName = window.prompt("Name your new search: ");
	} while(searchName != null && !searchName.trim().match(ENGLISH_REGEX))

	if(searchName == null) return;

	chrome.tabs.executeScript( {
    	code: "window.getSelection().toString();"
	}, function(selection) {
		var selectedText = selection[0];
		background.addFavoriteSearch({name:searchName, query: selectedText}, null, function(response){
			console.log("Got a response: ", response);
		});
	});
}

function createContextMenus() {

	chrome.contextMenus.create({
		title: "Open Dictionary",
			contexts:["all"],  
		 onclick: menuOpenOptions
	});


	chrome.contextMenus.create({
		 title: "Add \"%s\" as new keyword",
			contexts:["selection"],  
		 onclick: menuAddKeyword
	});

	chrome.contextMenus.create({
		 title: "Add \"%s\" as translation for keyword...",
			contexts:["selection"],  
		 onclick: menuAddTranslation
	});

	chrome.contextMenus.create({
			 title: "Save as favorite search...",
			contexts:["selection"],  
			 onclick: menuAddSearch
	});

}


function setDictionary(dict) {
	dictionary = dict;
}

function setFavoriteSearches(searches) {
	favoriteSearches = searches;
}


function addQuotes(str) {
	return "\"" + str + "\"";
}

// creates a size x size 2D array with
// boolean values set to false
function createTruthTable(size) {
	var arr = []
	for(var i = 0; i< size; i++) {
		arr[i] = [];
	}

	for(var i = 0; i < size; i++)
		for(var j = 0; j < size; j++)
			arr[i][j] = false;
	return arr;
}

/*
  Loops diagonally through the truth table from the main diagonal (\) to the upper right.
  Checks if substrings of the query have an existing translation in the dictionary,
  and marks that entry in the table accordingly.

  table[i][j] being set to true means that there is an existing entry in the dictionary for
  the substring that begins with word i and ends with word j (i==j is a single word).
*/
function populateTruthTable(table, spaceIndexes, numWords, query) {
	var rowStart;
	var rowEnd = numWords -1; // decreases per iteration
	var colStart = 0; // increases per iteration
	var wordStart = 0;

	while(colStart < numWords) {
		rowStart = 0;
		var j = colStart;
		wordStart = 0;
		while(rowStart<=rowEnd) {
			var word;
			var wordEnd;

			if(rowStart === rowEnd)
				wordEnd = query.length;
			else
				wordEnd = spaceIndexes[j]



			word = query.substring(wordStart, wordEnd);


			table[rowStart][j] = !(dictionary.keywords[word] === undefined);
			//console.log("(" + rowStart + "," + j + ") - Is " + word + " in the dictionary?: " + !(dictionary.keywords[word] === undefined));
			wordStart = spaceIndexes[rowStart] + 1;
			rowStart++;
			j++;
		}
		rowEnd--;
		colStart++;
	}

}


/*
	Grabs the dictionary entry for a word/phrase and places the word and
	returns all of its tranlsations.

	If collapse is true(OR search), it returns the translations as a space-separated string,
	If collapse is false (AND search), it returns the translations as a space-separated string
	surrounded by parenstheses.
*/
function createTranslationGroup(word, collapse) {
	var translations = dictionary.keywords[word];

	if(translations === undefined) return "";

	if(word.includes(" "))
		word = addQuotes(word);
	var segments = [word];
	for(var i = 0; i< translations.length; i++) {
		var seg = translations[i];
		if(seg.includes(" "))
			seg =  addQuotes(seg);
		segments.push(seg);
	}
	if(collapse)
		return segments.join(" ");
	else
		return "(" + segments.join(" ") + ")";

}


/*
	Creates a translation truth table and iterates from top to bottom row-wise and from
	right to left column-wise. It looks for the largest translatable block of words starting at the
	left of the query.

	When a translatable block is found, the translation group for that block is constructed and added
	to the translation, and the search continues on the rest of the query/table.
	If an Entry(i,i) on the major diagonal (\) of the table is reached,
	then there is no translatable block of more than one word that begins with the word corresponding to Entry(i,i),
	so the word is either added to the translation as-is if Entry(i,i) is false, or its translation group
	is added to the translation if Entry(i,i) is true.

	ex:
		Query: ernie ball guitar strings slinky

		The dictionary contains translations for "Ernie Ball", "ball", "guitar strings", but not "slinky".

		Table:      E  B  G  S  N
		Ernie		0  1  0  0  0
		Ball		0  1  0  0  0
		Guitar		0  0  0  1  0
		Strings		0  0  0  0  0
		Slinky		0  0  0  0  0

		Entry (0,1) is set to true, and ("ernie ball"  アーニーボール) is added to the translation.
		The search continues on the subtable with entry (2,2) in the top left corner. This ignores
		the existing translation for "ball", because it contains less words than "ernie ball", and is
		probably not relevant to this query.

					G  S  N
		Guitar		0  1  0
		Strings		0  0  0
		Slinky		0  0  0

		Entry(2,3) is set to true, and ("guitar strings" ギター弦) is added to the translation.
		The search continues on the subtable:

				   S
		Slinky     0


		Entry (4,4) is false, so slinky is added to the translation  as-is. If the dictionary had a translation for
		slinky, Entry (4,4) would be true, and something like ("slinky" スリンキー).


	Segment Types:
		AND (collapse = false) : Written as a series of keywords with no parentheses.
		All keywords must be present in the returned search results. For these segments, translateQuerySegment
		returns a series of translation groups for each word, each surrounded by parentheses (except for words
		with no translations).
		ex: (key1 key1_translation1 key1_translation2) (key2 key2_tranlsation1 key2_translation2) key3


		OR (collapse = true: Written as a series of keywords surrounded by parentheses. At least one of the specified keywords
		must be present in the returned search results. For these segments, translateQuerySegment combines the
		translation groups for each word into one transaltion group separated by parentheses.
		ex: (key1 key1_translation1 key1_translation2 key2 key2_tranlsation1 key2_translation2 key3)

 */

function translateQuerySegment(query, collapse) {
	var translationGroups = [];

	var spaceCount = 0;
	var spaceIndexes = [];


	if(collapse)
		query = query.replace(/[\(\)]/g, "");


	for(var i = 0; i < query.length; i++) {
		if(query.charAt(i) === ' ') {
			spaceCount++;
			spaceIndexes.push(i);
		}
	}


	var numWords = spaceCount +1;
	var translationTable = createTruthTable(numWords);

	populateTruthTable(translationTable, spaceIndexes, numWords, query);

	var rowMin = 0;
	var colMin = 0;
	var wordStart = 0;


	for(var i = rowMin; i<= numWords-1; i++) {
		innerloop:
		for(var j = numWords-1; j>=colMin; j--) {
			if(translationTable[i][j]) {  //dictionary has an entry that starts with word i and ends with word j
				var word;
				var wordEnd;

				if(j != numWords-1)
					wordEnd = spaceIndexes[j];
				else
					wordEnd = query.length;

					word = query.substring(wordStart, wordEnd);

				translationGroups.push(createTranslationGroup(word, collapse));  //creates translation group for block
				var m = Math.max(i,j);
				colMin = m+1;
				rowMin = m+1;  //block translated, ignore that section of the table in the next iteration
				break innerloop;
			} else {
				if (j === colMin && i === j ) {  //hit the diagonal and no translation exists, add word as-is
					var word = query.substring(wordStart, spaceIndexes[i]);
					translationGroups.push(word);
					colMin++;
					rowMin++;
				}
			}
		}
		wordStart = spaceIndexes[i] + 1; //
	}

	if(collapse)
		return "(" + translationGroups.join(" ") + ")";
	else
		return translationGroups.join(" ");
}



// Splits search query into its AND and OR segments, translates
// each segment, and returns the results separated by spaces.
function translateQuery(query) {

	var matches = query.match(QUERY_REGEX);
	var segments = [];

	for(var i = 0; i < matches.length; i++) {

		var orSearch = OR_SEARCH_REGEX.test(matches[i]);
		segments.push(translateQuerySegment(matches[i], orSearch));

	}

	return segments.join(" ");
}


var dictionary, favoriteSearches;

//chrome.storage.sync.remove("mainDictionary");
//chrome.storage.sync.remove("favoriteSearches");

background.init();