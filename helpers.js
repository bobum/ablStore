var fs = require('fs');

exports.writeFile = function (fileName, data){
	console.log('writing');
	fs.writeFile(__dirname + '/' + fileName, data, (err) => {	
		  
		  if (err){
		  	console.log("error writing:", err);
	    	return console.log("file name:", fileName);
	  	}
		  console.log('saved:',fileName);
	});
}