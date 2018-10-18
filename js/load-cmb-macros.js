// Load CMB's macros onto webpage

// Markdown parser
let reader = new commonmark.Parser();
let writer = new commonmark.HtmlRenderer();

readTextFile("macros.json");

async function readTextFile(file)
{
	const response = await fetch(file);
	const macros = await response.json();
	displayMacros(macros)
}

function displayMacros(macros){
	let macroObjects = new Array();

	// Parse macros from text file and store in macroObjects array
	for(let key in macros){
		if (!macros.hasOwnProperty(key)) continue

		let macro = macros[key]

		let macroName = macro.name;
		let macroAuthorID = macro.owner;
		let macroText = macro.text;

		// Replace the URL links with an image tag
		macroText = replaceImageURLs(macroText);
		
		// Use commonmark to parse Markdown
		let parsed = reader.parse(macroText);
		let resultText = writer.render(parsed);
		
		if(macroName !== "undefined" && macroName != null && macroName !== "")
			macroObjects.push({"name" : macroName, "authorID" : macroAuthorID, "text" : resultText});
	}

	// Sort macros by author and name
	macroObjects.sort(function(x, y) {
		return x.authorID - y.authorID;
	});

	let authorID = -1;
	node = document.getElementById('macrolist');
	
	// Add the macros to the webpage
	for(let i = 0; i < macroObjects.length; ++i){
		//console.log("macroObject:" + i + " is " + macroObjects[i]);
		
		let macroName = macroObjects[i].name;
		let macroAuthorID = macroObjects[i].authorID;
		let macroText = macroObjects[i].text;
		
		if(authorID != macroAuthorID){
			node = document.getElementById('macrolist');
			node.insertAdjacentHTML('beforeend', '<div id=\'macro-author-' + macroAuthorID + '\' class=\'macroauthor\'>userid: ' + macroAuthorID + '</div>');
			authorID = macroAuthorID;
		}
		
		node = document.getElementById('macro-author-'+macroAuthorID);
		node.insertAdjacentHTML('beforeend', '<div id=\'macro-'+i+'\' class=\'macro\'></div>');
		
		node = document.getElementById('macro-' + i);
		node.insertAdjacentHTML('beforeend', '<div id=\'macroname-'+i+'\' class=\'spoiler-toggle\'><code>' + macroName + '</code></div>');
		node.insertAdjacentHTML('beforeend', '<div id=\'macroname-'+i+'\' class=\'spoiler\'>' + macroText + '</div>');
	}
	
	// After displaying macros, add the event
	$.getScript("../resources/spoiler.js",function(){
		console.log("Calling spoiler.js");
	});
}

$(document).ready(function(){
	$(".expand-all").on('click', function(){
		$(".spoiler").show("slow","swing");
	});
});

$(document).ready(function(){
	$(".collapse-all").on('click', function(){
		$(".spoiler").hide("slow","swing");
	});
});

// This section taken from the following stack overflow question
// https://stackoverflow.com/questions/8540089/convert-url-to-html-a-tag-and-image-url-to-img-tag-with-javascript-regular-e#27673318
// Credit to joe-tom

function replaceImageURLs(yourString){
	let urlcount=0;
	let urls=yourString.match(/(?:^|[^"'])(\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|])/gim);
	// Make an array of urls
	
	if(urls === "undefined" || urls == null){
		console.log("urls was null!");
		return yourString;
	}
	
	//console.log("urls.length:" + urls.length);
	
	urls.forEach(function(v,i,a){
		let n =    yourString.indexOf(v,urlcount); //get location of string
		
		if(v.match(/\.(png|jpg|jpeg|gif)$/)===null){// Check if image 
			// If link replace yourString with new  anchor tag
			yourString  = strSplice(yourString,n,v.length,'<a href="'+v+'">'+v+'</a>');
			urlcount += (v.length*2)+16;// Increase urlcount incase there are multiple of the same url.
		}else{
			// If link replace yourString with img tag
			yourString  = strSplice(yourString,n,v.length,'<img src="'+v+'"/>');
		    urlcount += v.length+14;// Increase urlcount incase there are multiple of the same url.
		}
	});
	
	return yourString;
}

// A function to splice strings from another SO post.
function strSplice(str, index, urlcount, add) {
  return str.slice(0, index) + (add || "") + str.slice(index + urlcount);
};