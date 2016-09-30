var fs = require('fs');
var express = require('express');
var app = express();
var users;
var items;
var transactions;

function writeFile (fileName, data){
	console.log('writing');
	fs.writeFile(__dirname + '/' + fileName, data, (err) => {	
		  
		  if (err){
		  	console.log("error writing:", err);
	    	return console.log("file name:", fileName);
	  	}
		  console.log('saved:',fileName);
	});
}


fs.stat(__dirname + '/items.json', (err, stats) => {
		if (err){
	    	console.log("error reading: items.json");
				var newItems = {
    		items: [{
    				description: "+1 awesomeness",
    				amount: 500
    		}]
    	};
	    	
    	var serialized = JSON.stringify(newItems);
    	writeFile('items.json', serialized);  
    	items = newItems;
		} else {
			fs.readFile(__dirname + '/items.json', 'utf8', (err, data) => {
			  if (err) {
			    return console.log("error reading: ", err);
			  }
			  items = JSON.parse(data);			  
			});
		}
		console.log("loaded: ",items);
	}
);

fs.stat(__dirname + '/transactions.json', (err, stats) => {
		if (err){
	    	console.log("error reading: transactions.json");
	    	var now = Date.now();
				var newTransactions = {
    		transactions: [{
    				userName: "seed",
    				purchase: "this item",
    				dateTime: now,
    				amount: 500
    		}]
    	};
	    	
    	var serialized = JSON.stringify(newTransactions);
    	writeFile('transactions.json', serialized);  
    	transactions = newTransactions;
		} else {
			fs.readFile(__dirname + '/transactions.json', 'utf8', (err, data) => {
			  if (err) {
			    return console.log("error reading: ", err);
			  }
			  transactions = JSON.parse(data);			  
			});
		}
		console.log("loaded: ",transactions);
	}
);

fs.stat(__dirname + '/users.json', (err, stats) => {
		if (err){
	    	console.log("error reading: users.json");
				var newUsers = {
    		users: [{
    				userName: "bobum",
    				pass: "baseball"
    		}]
    	};
	    	
    	var serialized = JSON.stringify(newUsers);
    	writeFile('users.json', serialized);  
    	users = newUsers;
		} else {
			fs.readFile(__dirname + '/users.json', 'utf8', (err, data) => {
			  if (err) {
			    return console.log("error reading: ", err);
			  }
			  users = JSON.parse(data);			  
			});
		}
		console.log("loaded: ",users);
	}
);

app.get('/newUser', function(req, res) {
	
	console.log(req);
  res.send('hello world');
});


app.use(express.static('public'));
app.listen(8000);