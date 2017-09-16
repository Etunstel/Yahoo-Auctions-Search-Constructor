chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------
		var accordionButton = document.createElement("div");
		$(accordionButton).addClass("accordion");
		$(accordionButton).addClass("untBody");
		$(accordionButton).html("Search Constructor")

		var panel = document.createElement("div");
		$(panel).addClass("panel");
		var searchBar = $('#acWrGlobalNavi');

   		$(accordionButton).insertAfter(searchBar);
   		 console.log("ADDED BUTTON");
   		$(panel).insertAfter(accordionButton);
   		console.log("ADDED Panel");

   		 $(accordionButton).click(function() {
   		 	this.nextElementSibling.classList.toggle("show");
   		 });

   		 var brandColumn = document.createElement("div");
   		 $(brandColumn).attr('id','brandColumn');
   		 $(brandColumn).addClass('optionColumn');





   		 var typeColumn = document.createElement("div");
   		 $(typeColumn).attr('id','typeColumn');
   		 $(typeColumn).addClass('optionColumn');

   		 var materialColumn = document.createElement("div");
   		 $(materialColumn).attr('id', 'materialColumn');
   		 $(materialColumn).addClass('optionColumn');

		 var specialColumn = document.createElement("div");
		 $(specialColumn).attr('id','specialColumn');
   		 $(specialColumn).addClass('optionColumn');




   		 $(panel).append(brandColumn);
   		 $(panel).append(typeColumn);
   		 $(panel).append(materialColumn);
   		 $(panel).append(specialColumn);
   		
	}
	}, 10);
});

// id of search bar is acHdSchBtn

/*




div accordion
	div panel
		div column1
		div column2
		div column3
		div column4












*/