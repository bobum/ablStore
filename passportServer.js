var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var fs = require('fs');

var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var db = require('./db');
var helpers = require('./helpers.js');

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];


var TOKEN_DIR = process.env.HOME + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
console.log(TOKEN_PATH);


// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { 
    	user: req.user,
    	items: db.items.getItems(),
    	categories: db.items.getCategories() });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });
  
app.get('/transaction',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
  	var username = req.query.username;
  	var description = req.query.description;
		var amount = req.query.amount;
			
  	db.users.findByUsername(username, function(err, user) {
      if (err || !user) { 
      	res.send({data:"fail"});
      	return; 
      }
			
			if(user.balance - amount >= 0){
				db.transactions.addNewTransaction(username, description, amount);
				db.users.updateUserBalance(username, user.balance - amount);
				res.send({data:"success"});
				return;
			}else{
				res.send({data:"can't afford"});
      	return; 	
			}
    });    
  }
);
  
app.get('/newUser', function(req, res) {
	var userName = req.query.username;
	var password = req.query.password;
	var displayName = req.query.displayName;
	var email = req.query.email;
	db.users.addNewUser(userName, password, displayName, email)
  res.send('hello world');
});

///////////////////////////////////sheets
// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.
  authorize(JSON.parse(content), listMajors);
  authorize(JSON.parse(content), testput);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
	oauth2Client.getToken('4/Z1qTpjzAklRnDNjWPWNPEiVs5sPQ7o14Ab7d1sI4Rfk', function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  /*var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken('4/Z1qTpjzAklRnDNjWPWNPEiVs5sPQ7o14Ab7d1sI4Rfk', function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });*/
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function testput(auth){
	var values = [ [ 'Alexandra', 'Female', '4. Senior', 'CA', 'English' ],
     [ 'Andrew', 'Male', '1. Freshman', 'SD', 'Math' ],
     [ 'Anna', 'Female', '1. Freshman', 'NC', 'English' ],
     [ 'Becky', 'Female', '2. Sophomore', 'SD', 'Art' ],
     [ 'Benjamin', 'Male', '4. Senior', 'WI', 'English' ],
     [ 'Carl', 'Male', '3. Junior', 'MD', 'Art' ],
     [ 'Carrie', 'Female', '3. Junior', 'NE', 'English' ],
     [ 'Dorothy', 'Female', '4. Senior', 'MD', 'Math' ],
     [ 'Dylan', 'Male', '1. Freshman', 'MA', 'Math' ],
     [ 'Edward', 'Male', '3. Junior', 'FL', 'English' ],
     [ 'Ellen', 'Female', '1. Freshman', 'WI', 'Physics' ],
     [ 'Fiona', 'Female', '1. Freshman', 'MA', 'Art' ],
     [ 'John', 'Male', '3. Junior', 'CA', 'Physics' ],
     [ 'Jonathan', 'Male', '2. Sophomore', 'SC', 'Math' ],
     [ 'Joseph', 'Male', '1. Freshman', 'AK', 'English' ],
     [ 'Josephine', 'Female', '1. Freshman', 'NY', 'Math' ],
     [ 'Karen', 'Female', '2. Sophomore', 'NH', 'English' ],
     [ 'Kevin', 'Male', '2. Sophomore', 'NE', 'Physics' ],
     [ 'Lisa', 'Female', '3. Junior', 'SC', 'Art' ],
     [ 'Mary', 'Female', '2. Sophomore', 'AK', 'Physics' ],
     [ 'Maureen', 'Female', '1. Freshman', 'CA', 'Physics' ],
     [ 'Nick', 'Male', '4. Senior', 'NY', 'Art' ],
     [ 'Olivia', 'Female', '4. Senior', 'NC', 'Physics' ],
     [ 'Pamela', 'Female', '3. Junior', 'RI', 'Math' ],
     [ 'Patrick', 'Male', '1. Freshman', 'NY', 'Art' ],
     [ 'Robert', 'Male', '1. Freshman', 'CA', 'English' ],
     [ 'Sean', 'Male', '1. Freshman', 'NH', 'Physics' ],
     [ 'Stacy', 'Female', '1. Freshman', 'NY', 'Math' ],
     [ 'Thomas', 'Male', '2. Sophomore', 'RI', 'Art' ],
     [ 'Will', 'Male', '4. Senior', 'FL', 'Math' ] ];
	var body = {
  'values': values
}
	var sheets = google.sheets('v4');
  sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: '1rAZuAYSqtKfPggAa9MeyuH_sBkNwzizBjIRbWHe0iPQ', //mine
    //spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', 
    //range: 'Class Data!A2:E',
    range: 'Sheet1!A1', //mine
    valueInputOption: 'RAW',
    fields: "updatedCells",
    resource: body
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    } else {
    		console.log(response.updatedCells);
    	}
  })
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajors(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    //spreadsheetId: '1rAZuAYSqtKfPggAa9MeyuH_sBkNwzizBjIRbWHe0iPQ', //mine
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', 
    range: 'Class Data!A2:E',
    //range: 'Sheet1!B2:S', //mine
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log(response);
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      console.log('Name, Major:');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        console.log('%s, %s', row[0], row[4]);
      }
    }
  });
}
///////////////////////////////////////sheets







app.use(express.static('public'));
app.set('port', (process.env.PORT || 3000));
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
//app.listen(app.get('port'), function() {
//  console.log('Node app is running on port', app.get('port'));
//});
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
module.exports = app ;

console.log(process.env.PORT);
console.log(process.env.OPENSHIFT_NODEJS_PORT);
console.log(process.env.IP);
console.log(process.env.OPENSHIFT_NODEJS_IP);
console.log(process.env);