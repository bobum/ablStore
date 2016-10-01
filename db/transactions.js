var fs = require('fs');
var helpers = require('../helpers.js');
var transactions;
var transactionPath = '/../transactions.json';

fs.stat(__dirname + transactionPath, (err, stats) => {
		if (err){
	    	console.log("error reading: transactions.json");
	    	var now = Date.now();
				var newTransactions = [{
    				userName: "seed",
    				purchase: "this item",
    				dateTime: now,
    				amount: 500
    		}];
	    	
    	var serialized = JSON.stringify(newTransactions);
    	helpers.writeFile('transactions.json', serialized);  
    	transactions = newTransactions;	
			  console.log('transactions:',transactions);		
		} else {
			fs.readFile(__dirname + transactionPath, 'utf8', (err, data) => {
			  if (err) {
			    return console.log("error reading: ", err);
			  }
			  transactions = JSON.parse(data);	
			  console.log('transactions:',transactions);				  
			});
		}
	}
);

exports.getTransactions = function(){
	return transactions;
}