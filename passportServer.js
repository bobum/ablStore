var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var helpers = require('./helpers.js');


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
