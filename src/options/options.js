

var KEYTAG_REGEX = /(^[^"':;\s]+$|^"[^"':;\s]+(?:\s+[^"':;\s]+)+")/;
var SINGLE_KEYWORD_REGEX = /^([^"':;\s]+)$/;
var SPACED_KEYWORD_REGEX = /^(^"[^"':;\s]+(?:\s+[^"':;\s]+)+")$/;
var ENGLISH_REGEX = /^(^[^"':;\s]+(?:\s+[^"':;\s]+)*)$/;

function Dictionary(title) {
	this.title = title;
	this.keywords = {};
}

function Keyword(englishName, translations, category) {
		this.englishName = englishName;
		this.translations = translations;
		if(category)
			this.category = category;
		else
			this.category = "Uncategorized";
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
	const text = cell.textContent;

	 if(!ENGLISH_REGEX.test(text)){
		cell.classList.toggle("input-error");
		return false;
	  }

	  return true;
}


// For newly added keywords, their "English" column
// is editable until a valid word/phrase is entered.
function makeEnglishEditable(cell){

	const saveButton = document.getElementById("save-button");
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
function makeTranslationsUneditable(table, cell) {

	const outer = cell.firstChild;
	const enteredWords = outer.firstChild;
	const tags = Array.from(enteredWords.getElementsByClassName("keyword-tag"));
	const inputErrors = table.getElementsByClassName("input-error");

	let names = [];

	for(tag in tags) {
	  names.push(tags[tag].firstChild.innerHTML);
	}
	cell.innerHTML = names.join(",");
	cell.classList.remove("editing");

	const saveButton = document.getElementById("save-button");
	if(inputErrors.length === 0)
	  saveButton.disabled = false;
}


//  Turns table data into a list of keyword tags and adds a text box for
//  entering more keywords.
function makeTranslationsEditable(table, cell) {

	if(cell.classList.contains("editing"))
	  return;

	const saveButton = document.getElementById("save-button");
	saveButton.disabled = true;

	cell.classList.add("editing");
	const keywords = cell.innerHTML.trim().split(",");

	const translOuter = document.createElement("span");
	translOuter.classList.add("translation-outer");
	translOuter.classList.add("edit-box")

	const enteredWords = document.createElement("span");
	enteredWords.id = "enteredWords";
	enteredWords.class = "keyword-container";

	const addBox = document.createElement("input");
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
		makeTranslationsUneditable(table, cell);
	});

	addBox.addEventListener("focusin", function(){
		if(document.activeElement!=this)
			document.activeElement.blur()
	})


	for(i in keywords) {
	  let tag = createKeywordTag(keywords[i]);
	  if(tag!=null)
		enteredWords.appendChild(tag);
	}


	translOuter.appendChild(enteredWords);
	translOuter.appendChild(addBox);

	cell.innerHTML = "";
	cell.appendChild(translOuter);
	addBox.focus();
}

function addTableRow(englishName, translations, category) {
  let table = document.getElementById("keyword-table");

   let newRow = document.createElement("tr");
   let englishTD = document.createElement("td");
   let placeHolder = table.getElementsByClassName("table-placeholder")[0];

   if(placeHolder!=null){
	  placeHolder.parentNode.removeChild(placeHolder);
   }

   if(englishName.includes("\""))
	  englishName = englishName.replace(/"/g,"");

   englishTD.innerHTML = englishName;

   let japaneseTD = document.createElement("td");
   japaneseTD.innerHTML = translations.join(",");
   japaneseTD.classList.add("translation-column");

   let deleteTD = document.createElement("td");
   deleteTD.classList.add("delete-column");
   deleteTD.innerHTML = "\u2a2f";

   newRow.appendChild(englishTD);
   newRow.appendChild(japaneseTD);
   newRow.appendChild(deleteTD);
   newRow.classList.add("keyword-row");
   newRow.setAttribute("data-category", category);

   japaneseTD.addEventListener('click',  function(event) {
   	if (!window.getSelection().toString()) //nothing highlighted
	  	makeTranslationsEditable(table, this);
   })

    deleteTD.addEventListener('click', function(event){
		if(confirm("Delete keyword " + englishTD.textContent + "?")) {
		  deleteRow(table, this.parentNode, true);
		}
   })


    newRow.addEventListener("transitionend", function(event){
    	newRow.parentNode.removeChild(newRow);

		const inputErrors = table.getElementsByClassName("input-error");

		let category = newRow.getAttribute("data-category");
		let x = categoryAmounts.get(category);
		x--;
		categoryAmounts.set(category, x);
		if(x===0)
			showPlaceHolder();

		const saveButton = document.getElementById("save-button");
		if(saveButton.disabled && inputErrors.length===0)
		  saveButton.disabled =false;
    })

    englishTD.setAttribute("draggable", "true");

    englishTD.addEventListener("dragstart", function(evt) {
    	rowDragStartHandler(evt);
    })

   if(translations.length ===0 )
	  makeEnglishEditable(englishTD);

	let x = categoryAmounts.get(category);

	if(x==0)
		hidePlaceHolder();
	x++;
	categoryAmounts.set(category, x);

   table.tBodies[0].appendChild(newRow);
}

// deletes table row and removes the keyword from the (local) dictionary
function deleteRow(table, row, deleteKeyword) {

	let englishTD = row.firstElementChild;
	let englishName = englishTD.textContent.toLowerCase();
	let tableBody = table.firstChild;


	if(deleteKeyword)
		delete dictionary.keywords[englishName];

	row.style.opacity = 0; //transitionend listener will remove row from table
}

function setCategory(row, newCategory) {

	row.setAttribute("data-category", newCategory);

}


function rowDragStartHandler(event) {
	var row = event.target.parentNode;
	var rowIndex = Array.from(row.parentNode.children).indexOf(row);

	var data = {rowIndex: rowIndex, originCategory: row.getAttribute("data-category")};
	event.dataTransfer.effectAllowed = "move";
	event.dataTransfer.setData("text/plain", JSON.stringify(data));
	event.dataTransfer.setDragImage(event.target, 0, 0);
}



function categoryDragOverHandler(event) {
	event.preventDefault();
	event.dataTransfer.dropEffect = "move";
}

function categoryDropHandler(event) {

	const categoryButton = event.target;
	const table = document.getElementById("keyword-table");
	var data;
	try{
		data = JSON.parse(event.dataTransfer.getData("text/plain"));
	} catch(error){
		return;
	}

	const draggedRow = table.tBodies[0].childNodes[data.rowIndex+1];

	let newCategory = categoryButton.getAttribute("data-category");
	let oldCategory = draggedRow.getAttribute("data-category");

	if(newCategory===oldCategory) return;

	if(newCategory === "All")
		newCategory = "Uncategorized";


	setCategory(draggedRow, newCategory);
	draggedRow.style.display = "none";

	categoryAmounts.set(newCategory, categoryAmounts.get(newCategory)+1);
	categoryAmounts.set(oldCategory, categoryAmounts.get(oldCategory)-1);

	if(categoryAmounts.get(oldCategory)==0)
		showPlaceHolder();
}


function showPlaceHolder() {

	let placeholder = document.getElementById("placeholder-row");

	placeholder.style.display = "";
}

function hidePlaceHolder() {
	let placeholder = document.getElementById("placeholder-row");

	placeholder.style.display = "none";
}



// populateTables
function populateTable(dictionary){
  if(!(isEmpty(dictionary) ||isEmpty(dictionary.keywords))) {

	  let names = Object.keys(dictionary.keywords);
	  names.sort(function(a,b){
	  	a2 = a.replace(/["]/g, "");
	  	b2 = b.replace(/["]/g, "");
	  	return a2.localeCompare(b2);});


	  names.forEach(function(key,index) {

	  	let kw = dictionary.keywords[key];

	  	if(!categoryAmounts.has(kw.category)) {
	  		categoryAmounts.set(kw.category, 0);
	  	}

	  	addTableRow(kw.englishName, kw.translations, kw.category);

	});
	  hidePlaceHolder();
  } else {
  	showPlaceHolder();
  }
}



function scrollUp(table) {
	const container = table.parentNode;
	container.scrollTop = 0;
}

function scrollDown(table) {
	const container = table.parentNode;
	container.scrollTop = container.scrollHeight;
}


function createKeywordTag(text) {

  if(text === "") return null;

  const tag = document.createElement("span");
  tag.classList.add("keyword-tag");

  const tagText =  document.createElement("span");
  tagText.innerHTML= text;

  const removeButton = document.createElement("span");
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
	  let currText = textBox.value.trim();
	  currText = currText.replace(/&nbsp;|<div>|<br>|<\/div>/g, "");

	  if(currText.match(SINGLE_KEYWORD_REGEX)){ //single keyword entry

		currText = currText.replace(/["]/g, '');
		const textNode = createKeywordTag(currText);

		if(textNode != null)
		  keywordArea.appendChild(textNode);

		textBox.value = "";

	  } else  { //pasted line, or multiple keywords
		  const translations = getKeywordsIfValid(currText);

		  if(translations === undefined){
			return;
		  }else if(translations.length === 0) {

			textBox.classList.toggle("input-error");
			return;

		  } else {

			  for(i in translations) {
				let textNode = createKeywordTag(translations[i]);
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
	let quotesSplit = line.split("\"");
	let validKeywords = [];

	for (let i = 0; i < quotesSplit.length; i++) {
		if(!(quotesSplit[i] === "")){
		  if ((i % 2) == 0) {  //even entries contain space-separated single keywords
			let singleWords = quotesSplit[i].replace(/\s{2,}/g, " "); //replace multi spaces
			singleWords = singleWords.split(" ");

			for (let j in singleWords){
			  if(singleWords[j] != "") {
				if(!singleWords[j].match(KEYTAG_REGEX)) {
				  return []; //invalid single keyword
				}
				  validKeywords.push(singleWords[j]);
				}
			  }
		} else {//odd
			let noMultis = quotesSplit[i].replace(/\s{2,}/g, " ");

			if(noMultis.match(SINGLE_KEYWORD_REGEX)) {
			  return [];
			}
			let singleWords = noMultis.split(" ");

			for (let j in singleWords){
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

function addNewCategory(){

	var categoryName;

	do{
		categoryName = window.prompt("Name your category: ");
	} while(categoryName != null && !categoryName.trim().match(ENGLISH_REGEX)
								&& !categoryName.trim().match(SPACED_KEYWORD_REGEX))
	if(categoryName == null) return;
	if(categoryName == "All" || categories.includes(categoryName)) {
		alert("Category Already Exists!")
		return;
	}

	categories.push(categoryName);
	addCategoryButton(categoryName);
}

function deleteActiveCategory(keepKeywords) {

	const categoryButtons = document.getElementById("category-buttons");
	console.log(categoryButtons);
	for(let i = 0; i< categories.length; i++)
		if(categories[i]===activeCategory)
			categories.splice(i,1);

	for(let i = 1; i< categoryButtons.childNodes.length; i++) {
		if(categoryButtons.childNodes[i].getAttribute("data-category")===activeCategory) {
			categoryButtons.removeChild(categoryButtons.childNodes[i]);
			break;
		}
	}

	if(categoryAmounts.get(activeCategory)>0) {
		const table = document.getElementById("keyword-table");
		const rows = table.tBodies[0].getElementsByClassName("keyword-row");

		let toRemove = [];
		for(let i = 0; i< rows.length; i++) {
			let rowCat = rows[i].getAttribute("data-category");
			if(rowCat===activeCategory) {
				if(keepKeywords) {
					setCategory(rows[i], "Uncategorized");
					categoryAmounts.set("Uncategorized", categoryAmounts.get("Uncategorized")+1);
				} else {
					toRemove.push(rows[i]);
				}
			}
		}

		toRemove.forEach(function(key,index) {
			table.tBodies[0].removeChild(key);
		});
	}


	categoryAmounts.delete(activeCategory);

	showCategory("All");
}

function addCategoryButton(category) {
	let menu = document.getElementById("category-buttons");

	let newButton = document.createElement("button");

	newButton.classList.add("category-button");
	newButton.setAttribute("data-category", category);
	newButton.innerHTML = category;

	newButton.addEventListener("click", function(event) {
		showCategory(category);
	});

	newButton.addEventListener("dragover", function(evt) {categoryDragOverHandler(evt)});

	newButton.addEventListener("drop", function(evt) {categoryDropHandler(evt)});

	menu.appendChild(newButton);
	if(!categoryAmounts.has(category))
		categoryAmounts.set(category, 0);
}



//TODO: Export/Import dictionaries to/from .json
function exportDictionary() {
     var dict  =  "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dictionary));
     var dllink  = document.createElement("a");
     dllink.href = "data:" + dict;
     dllink.download = "dictionary.json";
     dllink.click();
}



// Switches visible tab based on which menu section is clicked
function showMenuView(btn, id) {

	const views = document.getElementsByClassName("tabContent");
	const buttons = document.getElementsByClassName("tabButton");

	for(let i = 0; i< views.length; i++){
		views[i].style.display = "none";
	}


	for(let i = 0; i< views.length; i++)
		buttons[i].className = buttons[i].className.replace(" active", "");

	document.getElementById(id).style.display = "block";
	btn.classList.add("active");
}


// Switches visible Category table based on which category is clicked
function showCategory(category){
	const table = document.getElementById("keyword-table");
	const rows = table.tBodies[0].getElementsByClassName("keyword-row");
	const buttons = document.getElementsByClassName("category-button");

	const delCatButton = document.getElementById("del-category-button");
	const purgeCatButton = document.getElementById("purge-category-button");

	for(let i = 0; i< buttons.length; i++) {
		if(buttons[i].getAttribute("data-category") === category)
			buttons[i].classList.add("active");
		else
			buttons[i].className = buttons[i].className.replace(" active", "");
	}

	for(let i = 0; i< rows.length; i++) {
		let rowCat = rows[i].getAttribute("data-category");
		if(category === "All" || (rowCat === category || category === null)) {
			rows[i].style.display = "";
		} else {
			rows[i].style.display = "none";
		}
	}

	if(category === "All" || category === "Uncategorized") {
		if(!delCatButton.disabled) {
			delCatButton.disabled=true;
			purgeCatButton.disabled=true;
		}
	} else {
		if(delCatButton.disabled) {
			delCatButton.disabled=false;
			purgeCatButton.disabled=false;
		}
	}


	if((category === "All" && categoryAmounts.get("Uncategorized") === 0) ||categoryAmounts.get(category)===0)
		showPlaceHolder();
	else
		hidePlaceHolder();

	activeCategory = category;
	scrollUp(table);
}



function saveDictionaryChanges() {

	document.activeElement.blur();

	let d = new Dictionary("Main Dictionary");
	const table = document.getElementById("keyword-table");
	const rows = table.tBodies[0].getElementsByClassName("keyword-row");


	for (let j = 0; j < rows.length; j++) {
		  let row = rows[j];

		  let englishTD = row.children[0];

		  let englishName = englishTD.textContent.replace(/;&nbsp/g, "").trim();

		  let translations = row.children[1].innerHTML.split(",");

		  let category = row.getAttribute("data-category");

		  let keyword = new Keyword(englishName, translations, category);

		  d.keywords[englishName.toLowerCase()] = keyword;
	}

	dictionary = d;

	chrome.runtime.sendMessage({fn: "saveDictionary", dict: d});
	chrome.runtime.sendMessage({fn: "saveCategories", categories: categories});
}

function reloadDictionary(callback) {
  chrome.runtime.sendMessage({fn: "getDictionary"}, function(response){

	dictionary = response;
	callback(response);

  });
}

function reloadCategories(callback) {
	categoryAmounts = new Map();

	chrome.runtime.sendMessage({fn: "getCategories"}, function(response){
		categories = response;

		for(let i = 0; i< categories.length; i++)
			addCategoryButton(categories[i]);

		callback;
  	});

}


function initPageData() {
	reloadCategories(reloadDictionary(populateTable));
}

function init() {

	  document.addEventListener("DOMContentLoaded", function () {

		  const table = document.getElementById("keyword-table");


		  const saveButton = document.getElementById("save-button");
		  const addKWButton = document.getElementById("add-keyword-button");
		  const addCatButton = document.getElementById("add-category-button");

		  const allKWButton =  document.getElementById("all-button");
		  const uncatButton = document.getElementById("uncat-button");
		  const delCatButton = document.getElementById("del-category-button");
		  const purgeCatButton = document.getElementById("purge-category-button");



		  saveButton.addEventListener("click", function(event){
			saveDictionaryChanges();
		  })

		  addKWButton.addEventListener("click", function(event) {
			addTableRow("New Keyword", [], (activeCategory && !(activeCategory==="All")) ? activeCategory : "Uncategorized");
			scrollDown(table);
		  })

		  addCatButton.addEventListener("click", function(event) {
			addNewCategory()
		  });

		  allKWButton.addEventListener("click", function(event) {
		  	showCategory("All")
		  });

		  uncatButton.addEventListener("click", function(event) {
			showCategory("Uncategorized")
		  });

		  delCatButton.addEventListener("click", function(event) {
		  	deleteActiveCategory(true);
		  });

		  purgeCatButton.addEventListener("click", function(event){
		  	deleteActiveCategory(false);
		  })

		  allKWButton.addEventListener("dragover", function(evt) {categoryDragOverHandler(evt)});
		  uncatButton.addEventListener("dragover", function(evt) {categoryDragOverHandler(evt)});

		  allKWButton.addEventListener("drop", function(evt) {categoryDropHandler(evt)});
		  uncatButton.addEventListener("drop", function(evt) {categoryDropHandler(evt)});


		  const buttons = document.getElementsByClassName("tabButton");

		  for(let i = 0; i< buttons.length; i++)
			buttons[i].addEventListener("click", function(evt) {
				showMenuView(this, this.getAttribute("data-view"));
		   });

		initPageData();
  });
}

//copy of dictionary in storage
var dictionary, categories, activeCategory, categoryAmounts;

init();
