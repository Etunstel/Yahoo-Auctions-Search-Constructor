

var KEYTAG_REGEX = /(^[^"':;\s]+$|^"[^"':;\s]+(?:\s[^"':;\s]+)+")/;


var dictionary;


function handleEnglishCellClick(cell) {

}


function makeEnglishEditable(cell) {
    var currentName = cell.innerHTML;
    var newTextBox = document.createElement("input");
    newTextBox.type = "text";
    newTextBox.value = currentName;
    newTextBox.classList.add("english-edit-box");


    newTextBox.addEventListener("blur", function() {
      makeEnglishUneditable(cell);
    });


    cell.innerHTML = "";
    cell.appendChild(newTextBox);
}


function makeEnglishUneditable(cell) {
    var textBox = cell.firstChild;
    var currText = textBox.value;
    if(currText.match(KEYTAG_REGEX)){
        cell.innerHTML = currText;
    }
}



function addTableRow(table, englishName, keywords) {
   var newRow = document.createElement("tr");
   var englishTD = document.createElement("td");
   englishTD.contentEditable = true;
   englishTD.innerHTML = englishName;


   var japaneseTD = document.createElement("td");
   japaneseTD.innerHTML = keywords.join(",");

   newRow.appendChild(englishTD);
   newRow.appendChild(japaneseTD);

   englishTD.addEventListener('keypress', function(evt) {
         if (evt.which === 13) {
             evt.preventDefault();
          }
    });

   //englishTD.addEventListener('click', function(event) {
     // makeEnglishEditable(this);
   //})

   japaneseTD.addEventListener('click', function(event) {
      makeTranslationsEditable(this);
   })


   table.appendChild(newRow);



}


function populateTable(table, dictionary){
  if(dictionary.keywords.length ===0) {
     var newRow = document.createElement("tr");
     var englishTD = document.createElement("td");
     englishTD.innerHTML = "No keywords exist yet!"
     englishTD.classList.add("table-placeholder");

     var japaneseTD = document.createElement("td");
     japaneseTD.innerHTML = "Hey"

     newRow.appendChild(englishTD);
     newRow.appendChild(japaneseTD);
     table.appendChild(newRow);
  } else {
     Object.keys(dictionary.keywords).forEach(function(key,index) {
     addTableRow(table, key, dictionary.keywords[key]);
    });
  }
}


function createKeywordTag(text) {

  var tag = document.createElement("span");
  tag.classList.add("keyword-tag");

  var tagText =  document.createElement("span");
  tagText.innerHTML= text;

  var removeButton = document.createElement("span");
  removeButton.innerHTML = "\u2a2f";
  removeButton.classList.add("keyword-delete");

  tag.appendChild(tagText);
  tag.appendChild(removeButton);

  removeButton.addEventListener("click", function(){    this.parentNode.remove();});
  return tag;
}

function validateInput(textBox, keywordArea){
   var currText = textBox.value;
      currText = currText.replace(/&nbsp;|<div>|<br>|<\/div>/g, "").trim();
      if(currText.match(KEYTAG_REGEX)){
        currText = currText.replace(/["]/g, '');
        var textNode = createKeywordTag(currText);
        keywordArea.appendChild(textNode);
        textBox.value = "";
    }
}

function reloadDictionary(table, callback) {
  chrome.runtime.sendMessage({fn: "getDictionary"}, function(response){

    console.log("Got a response: ", response);
    dicitonary = response;
    callback(table, response);
  });
}


function init() {

      document.addEventListener("DOMContentLoaded", function () {

       var addBox = document.getElementById("translationaddbox");
       var keywordArea = document.getElementById("enteredWords");
       var table = document.getElementById("keywordTable");


       addBox.addEventListener('keypress', function(evt) {
         if (evt.which === 13) {
             evt.preventDefault();
          }
        });

        addBox.addEventListener("keyup", function(evt) {
          if(evt.keyCode == 32 ||evt.keyCode == 13 ) { //space
            validateInput(addBox, keywordArea);
          }
       });

       addBox.addEventListener("blur", function(evt) {
         validateInput(addBox, keywordArea);
        });

       reloadDictionary(table, populateTable);
      console.log(dictionary);

      if(dictionary === undefined) {
        console.log("No dictionary")
      } else {
        populateTable();
      }



  });
}




init();
