var fs = require('fs');
var helpers = require('../helpers.js');
var transactions;
var transactionsFile = 'transactions.json';
var transactionPath = '/../data/' + transactionsFile;

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

exports.addNewTransaction = function (userName, description, amount){
	var now = Date.now();	
	
	var newTransaction = {
			userName: userName,
			purchase: description,
			dateTime: now,
			amount: amount
	};
	
  transactions.push(newTransaction);
  var serialized = JSON.stringify(transactions);
  helpers.writeFile('transactions.json', serialized);	
}