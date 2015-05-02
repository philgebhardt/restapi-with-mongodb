var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var stormpath = require('express-stormpath');
var routes = require("./app/routes.js");
var db	 = require('./config/db');
var security = require('./config/security');

var app = express();
var morgan = require('morgan');
app.use(morgan('combined'));
app.use(stormpath.init(app, {
     apiKeyFile: './config/stormpath_apikey.properties',
     application: security.stormpath_application_url,
     secretKey: security.stormpath_secret_key
 }));

 var port = 8000;
 mongoose.connect(db.url);

app.use(bodyParser.urlencoded({ extended: true }));

routes.addAPIRouter(app, mongoose, stormpath);

// bad urls
app.use(function(req, res, next){
   res.status(404);
   res.json({ error: 'Invalid URL' });
});

app.listen(port);

console.log('Magic happens on port ' + port);

exports = module.exports = app;
