var fs = require('fs');
var helpers = require('../helpers.js');
var records;

fs.stat(__dirname + '/users.json', (err, stats) => {
		if (err){
	    	console.log("error reading: users.json");
				var newUsers = [
				    { id: 1, username: 'jack', password: 'secret', displayName: 'Jack', emails: [ { value: 'jack@example.com' } ] }
				  , { id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', emails: [ { value: 'jill@example.com' } ] }
				];
	    	
    	var serialized = JSON.stringify(newUsers);
    	helpers.writeFile('users.json', serialized);  
    	records = newUsers;
    	console.log('users:',records);
		} else {
			fs.readFile(__dirname + '/users.json', 'utf8', (err, data) => {
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
