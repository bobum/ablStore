var fs = require('fs');
var helpers = require('../helpers.js');
var items;
var itemsPath = '/../items.json';

fs.stat(__dirname + itemsPath, (err, stats) => {
		if (err){
	    	console.log("error reading: items.json");
				var newItems = [{
    				category: "traits",
    				description: "+1 awesomeness",
    				amount: 500
    		},{
    				category: "referrals",
    				description: "+1 awesomeness",
    				amount: 500
    		},{
    				category: "nicknames",
    				description: "+1 awesomeness",
    				amount: 500
    		},{
    				category: "traits",
    				description: "+5 awesomeness",
    				amount: 5000
    		}];
	    	
    	var serialized = JSON.stringify(newItems);
    	helpers.writeFile('items.json', serialized);  
    	items = newItems;	
			  console.log('items:',items);	
		} else {
			fs.readFile(__dirname + itemsPath, 'utf8', (err, data) => {
			  if (err) {
			    return console.log("error reading: ", err);
			  }
			  items = JSON.parse(data);	
			  console.log('items:',items);		  
			});
		}
	}
);

exports.getItems = function(){
	return items;
}

exports.getCategories = function(){
	var unique = {};
	var distinct = [];
	for( var i in items ){
	 if( typeof(unique[items[i].category]) == "undefined"){
	  distinct.push(items[i].category);
	 }
	 unique[items[i].category] = 0;
	}
	return distinct;
}