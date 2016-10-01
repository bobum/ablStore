var fs = require('fs');
var helpers = require('../helpers.js');
var records;
var userPath = '/../users.json';

fs.stat(__dirname + userPath, (err, stats) => {
		if (err){
	    	console.log("error reading: users.json");
				var newUsers = [
				    { id: 1, username: 'jack', password: 'secret', displayName: 'Jack', emails: [ { value: 'jack@example.com' } ], balance: 750 }
				  , { id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', emails: [ { value: 'jill@example.com' } ], balance: 0 }
				];
	    	
    	var serialized = JSON.stringify(newUsers);
    	helpers.writeFile('users.json', serialized);  
    	records = newUsers;
    	console.log('users:',records);
		} else {
			fs.readFile(__dirname + userPath, 'utf8', (err, data) => {
			  if (err) {
			    return console.log("error reading: ", err);
			  }
			  records = JSON.parse(data);		
			  console.log('users:',records);	  
			});
		}
	}
);

exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}

exports.updateUserBalance = function(userName, newBalance){	
	for (i = 0; i < records.length; i++) {		
		if(records[i].username == userName){
			records[i].balance = newBalance;
			var serialized = JSON.stringify(records);
			helpers.writeFile('users.json', serialized);	
			break;
		}
	}
}

exports.addNewUser = function (userName, password, displayName, email){
	var newId = records.length + 1;
	for (i = 0; i < records.length; i++) {
		if(records[i].username == userName){
				records.splice(i, 1);
				newId = i;
				break;
			}
	}
	
	var newUser = {
		id: newId,
		username: userName,
		password: password,
		displayName: displayName,
		emails: [{value: email}],
		balance: 0
	}
  records.push(newUser);
  var serialized = JSON.stringify(records);
  helpers.writeFile('users.json', serialized);	
}
