

var KEYTAG_REGEX = /(^[^"':;\s]+$|^"[^"':;\s]+(?:\s+[^"':;\s]+)+")/;
var SINGLE_KEYWORD_REGEX = /^([^"':;\s]+)$/;
var SPACED_KEYWORD_REGEX = /^(^"[^"':;\s]+(?:\s+[^"':;\s]+)+")$/;
var ENGLISH_REGEX = /^(^[^"':;\s]+(?:\s+[^"':;\s]+)*)$/;


function Dictionary(title) {
	this.title = title;
	this.keywords = {};
}

function isEmpty(obj) {
	for(key in obj) {
		if(obj.hasOwnProperty(key)){
			return false;
		}

	}
	return true;
}

function validateEnglishInput(cell){
	var text = cell.data;
	 if(!ENGLISH_REGEX.test(text)){
		cell.classList.toggle("input-error");
		return false;
	  }
	  return true;
}


// For newly added keywords, their "English" column
// is editable until a valid word/phrase is entered.
function makeEnglishEditable(cell){

	var saveButton = document.getElementById("save-button");
	saveButton.disabled = true;
	cell.contentEditable = true;


	cell.addEventListener("keyup", function(evt) {
		  if (evt.keyCode == 8) {
			if(this.classList.contains("input-error"))
				this.classList.toggle("input-error");
		  }
	  });

	cell.addEventListener("blur", function(evt) {
		if(!validateEnglishInput(this)){
			this.classList.add("input-error");
		} else {
			var saveButton = document.getElementById("save-button");
			saveButton.disabled =  false;
			this.contentEditable = false;
			this.classList.remove("input-error");
		}
	});

	 cell.addEventListener('keypress', function(evt) {
		 if (evt.which === 13) {
			 evt.preventDefault();

		  if(!validateEnglishInput(this)){
			this.classList.add("input-error");
		 } else {
			var saveButton = document.getElementById("save-button");
			saveButton.disabled = false;
			this.contentEditable = false;
			this.classList.remove("input-error");
		 }
	  }


	});

	cell.autofocus="autofocus";
}

// Converts keyword tags into a comma-separated list of keywords.
function makeTranslationsUneditable(cell) {

	var outer = cell.firstChild;
	var enteredWords = outer.firstChild;
	var tags = Array.from(enteredWords.getElementsByClassName("keyword-tag"));
	var names = [];
	var inputErrors = document.getElementsByClassName("input-error");

	for(tag in tags) {
	  names.push(tags[tag].firstChild.innerHTML);
	}
	cell.innerHTML = names.join(",");
	cell.classList.remove("editing");

	var saveButton = document.getElementById("save-button");
	if(inputErrors.length === 0)
	  saveButton.disabled = false;
}


//  Turns table data into a list of keyword tags and adds a text box for
//  entering more keywords.
function makeTranslationsEditable(cell) {

	if(cell.classList.contains("editing"))
	  return;

	var saveButton = document.getElementById("save-button");
	saveButton.disabled = true;

	cell.classList.add("editing");
	var keywords = cell.innerHTML.trim().split(",");

	var translOuter = document.createElement("span");
	translOuter.classList.add("translation-outer");
	translOuter.classList.add("edit-box")

	var enteredWords = document.createElement("span");
	enteredWords.id = "enteredWords";
	enteredWords.class = "keyword-container";

	var addBox = document.createElement("input");
	addBox.type = "text";
	addBox.id = "translationaddbox";



	addBox.addEventListener('keypress', function(evt) {
		 if (evt.which === 13) {
			 evt.preventDefault();
		  }
		});

	addBox.addEventListener("keyup", function(evt) {
		  if(evt.keyCode == 13 ) { //space 32
			validateInput(addBox, enteredWords);
		  } else if (evt.keyCode == 8) {
			if(this.classList.contains("input-error"))
				this.classList.toggle("input-error");
		  }
	  });

	addBox.addEventListener("blur", function(evt) {
		validateInput(addBox, enteredWords);
		makeTranslationsUneditable(cell);
	});

	addBox.addEventListener("focusin", function(){
		if(document.activeElement!=this)
			document.activeElement.blur()
	})


	for(i in keywords) {
	  var tag = createKeywordTag(keywords[i]);
	  if(tag!=null)
		enteredWords.appendChild(tag);
	}


	translOuter.appendChild(enteredWords);
	translOuter.appendChild(addBox);

	cell.innerHTML = "";
	cell.appendChild(translOuter);
	addBox.focus();
}

function addTableRow(table, englishName, keywords) {
   var newRow = document.createElement("tr");
   var englishTD = document.createElement("td");
   var placeHolder = document.getElementById("table-placeholder");

   if(placeHolder!=null){
	  placeHolder.parentNode.removeChild(placeHolder);
   }

   if(englishName.includes("\""))
	  englishName = englishName.replace(/"/g,"");

   englishTD.innerHTML = englishName;

   var japaneseTD = document.createElement("td");
   japaneseTD.innerHTML = keywords.join(",");
   japaneseTD.classList.add("translation-column");

   var deleteTD = document.createElement("td");
   deleteTD.classList.add("delete-column");
   deleteTD.innerHTML = "\u2a2f";

   newRow.appendChild(englishTD);
   newRow.appendChild(japaneseTD);
   newRow.appendChild(deleteTD);
   newRow.classList.add("keyword-row");

   japaneseTD.addEventListener('click',  function(event) {
   	if (!window.getSelection().toString()) //nothing highlighted
	  	makeTranslationsEditable(this);
   })

   if(keywords.length ===0 )
	  makeEnglishEditable(englishTD);

   table.tBodies[0].appendChild(newRow);

   deleteTD.addEventListener('click', function(event){
		if(confirm("Delete keyword " + englishTD.textContent + "?")) {
		  deleteRow(table, this.parentNode);
		}
   })
}

// deletes table row and removes the keyword from the (local) dictionary
function deleteRow(table, row) {
	var englishTD = row.firstElementChild;
	var englishName = englishTD.textContent;
	var tableBody = table.firstChild;

	var placeHolder = document.getElementById("table-placeholder");

	delete dictionary.keywords[englishName];

	row.style.opacity = 0;

	setTimeout(function(){

	row.parentNode.removeChild(row);

	var keyRows = document.getElementsByClassName("keyword-row");
	var inputErrors = document.getElementsByClassName("input-error");

	 if(keyRows.length === 0) // empty table
		  addTablePlaceHolder(table);

	var saveButton = document.getElementById("save-button");
	if(saveButton.disabled && inputErrors.length===0)
	  saveButton.disabled =false;
	}, 500);
}


function addTablePlaceHolder(table) {
	 var newRow = document.createElement("tr");
	 var td = document.createElement("td");
	 td.colSpan = 3;
	 td.innerHTML = "No keywords exist yet!"
	 td.classList.add("table-placeholder");
	 td.id = "table-placeholder";
	 newRow.appendChild(td);
	 table.tBodies[0].appendChild(newRow);

}

function populateTable(table, dictionary){
  if(isEmpty(dictionary.keywords)) {
	 addTablePlaceHolder(table);
  } else {
	  var names = Object.keys(dictionary.keywords);
	  names.sort(function(a,b){
	  	a2 = a.replace(/["]/g, "");
	  	b2 = b.replace(/["]/g, "");
	  	return a2.localeCompare(b2);});
	  names.forEach(function(key,index) {
		addTableRow(table, key, dictionary.keywords[key]);
	});
  }
}

function scrollDown(table) {
	var container = table.parentNode;
	container.scrollTop = container.scrollHeight;
}


function createKeywordTag(text) {

  if(text === "") return null;

  var tag = document.createElement("span");
  tag.classList.add("keyword-tag");

  var tagText =  document.createElement("span");
  tagText.innerHTML= text;

  var removeButton = document.createElement("span");
  removeButton.innerHTML = "\u2a2f";
  removeButton.classList.add("keyword-delete");

  tag.appendChild(tagText);
  tag.appendChild(removeButton);

  removeButton.addEventListener("click", function(){
	this.parentNode.remove();
  });

  tag.addEventListener("mousedown", function(event) {
		event.preventDefault();
  });

  return tag;
}

function validateInput(textBox, keywordArea){
	  var currText = textBox.value.trim();
	  currText = currText.replace(/&nbsp;|<div>|<br>|<\/div>/g, "");

	  if(currText.match(SINGLE_KEYWORD_REGEX)){ //single keyword entry

		currText = currText.replace(/["]/g, '');
		var textNode = createKeywordTag(currText);

		if(textNode != null)
		  keywordArea.appendChild(textNode);

		textBox.value = "";

	  } else  { //pasted line, or multiple keywords
		  var translations = getKeywordsIfValid(currText);

		  if(translations === undefined){
			return;
		  }else if(translations.length === 0) {

			textBox.classList.toggle("input-error");
			return;

		  } else {

			  for(i in translations) {
				var textNode = createKeywordTag(translations[i]);
				keywordArea.appendChild(textNode);
			  }
			  textBox.value = "";
		  }

	  }
}

// If the entire line of keywords is properly formatted, returns a list of
// all keywords in the line. Returns an empty list if the line is invalid.
function getKeywordsIfValid(line){
	if(line === "") return undefined;
	var quotesSplit = line.split("\"");
	var validKeywords = [];
	for (var i = 0; i < quotesSplit.length; i++) {
		if(!(quotesSplit[i] === "")){
		  if ((i % 2) == 0) {  //even entries contain space-separated single keywords
			var singleWords = quotesSplit[i].replace(/\s{2,}/g, " "); //replace multi spaces
			singleWords = singleWords.split(" ");

			for (var j in singleWords){
			  if(singleWords[j] != "") {
				if(!singleWords[j].match(KEYTAG_REGEX)) {
				  return []; //invalid single keyword
				}
				  validKeywords.push(singleWords[j]);
				}
			  }
		} else {//odd
			var noMultis = quotesSplit[i].replace(/\s{2,}/g, " ");

			if(noMultis.match(SINGLE_KEYWORD_REGEX)) {
			  return [];
			}
			var singleWords = noMultis.split(" ");

			for (var j in singleWords){
			  if(!singleWords[j].match(SINGLE_KEYWORD_REGEX)){
				return [];
			  }
			}

			validKeywords.push(noMultis);
		}
	  }
	}
	return validKeywords;
}



function saveDictionaryChanges() {

	document.activeElement.blur();

	var d = new Dictionary("Main Dictionary");
	var table = document.getElementById("keywordTable")
	var tableBody = table.tBodies[0];

	var rows = document.querySelectorAll("tr.keyword-row")


	for (var i = 0; i < rows.length; i++) {
	  var row = rows[i];
	  var englishTD = row.children[0];
	  var englishName = englishTD.textContent.toLowerCase().replace(/;&nbsp/g, "").trim();

	  var keywords = row.children[1].innerHTML.split(",");
	  d.keywords[englishName] = keywords;
	}


	dictionary = d;


	chrome.runtime.sendMessage({fn: "saveDictionary", dict: d});
}

function reloadDictionary(table, callback) {
  chrome.runtime.sendMessage({fn: "getDictionary"}, function(response){

	dictionary = response;
	callback(table, response);

  });
}

/*
TODO: Export/Import dictionaries to/from .json
function exportDictionary() {
     var dict  =  "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dictionary));
     var dllink  = document.createElement("a");
     dllink.href = "data:" + dict;
     dllink.download = "dictionary.json";
     dllink.click();
}
*/



function init() {

	  document.addEventListener("DOMContentLoaded", function () {

	  var keywordArea = document.getElementById("enteredWords");
	  var table = document.getElementById("keywordTable");
	  var saveButton = document.getElementById("save-button");
	  var addButton = document.getElementById("add-button");
	  var dlButton = document.getElementById("dl-button");

	  saveButton.addEventListener("click", function(event){
		saveDictionaryChanges();
	  })

	  addButton.addEventListener("click", function(event) {
		addTableRow(keywordTable, "New Keyword", []);
		scrollDown(keywordTable);
	  })


	  reloadDictionary(table, populateTable);
  });
}

//copy of dictionary in storage
var dictionary;

init();
