var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var stormpathExpress = require('express-stormpath');
var routes = require("./app/routes.js");
var db	 = require('./config/db');
var security = require('./config/security');
var stormpath = require('stormpath');
var spConfig = require('./config/stormpath.js');
var async = require('async');
var client = null;
var spApp=null;

var port = 8000;
var app = express();
var morgan = require('morgan');



console.log('Magic happens on port ' + port);



// ApplicationRuntime = {
//   lifecycle : {
//     set_env : function(locals) {
//       return function (callback) {
//         app.locals = locals;
//         callback(0);
//       };
//     },
//     start : function(app) {
//       return function(callback) {
        // app.use(morgan('combined'));
        // app.use(stormpath.init(app, {
        //      apiKeyFile: './config/stormpath_apikey.properties',
        //      application: security.stormpath_application_url,
        //      secretKey: security.stormpath_secret_key
        //  }));
        // mongoose.connect(db.url);
        // app.use(bodyParser.urlencoded({ extended: true }));
        // routes.addAPIRouter(app, mongoose, stormpath);
        // // bad urls
        // app.use(function(req, res, next){
        //    res.status(404);
        //    res.json({ error: 'Invalid URL' });
        // });
        //
        // app.listen(port);
//       };
//     }
//   }
// };

function setClient(callback) {
  console.log("function " + "setClient" + " called");
  stormpath.loadApiKey('config/stormpath_apikey.properties', function apiKeyFileLoaded(err, apiKey) {
    if (err) throw err;
    client = new stormpath.Client({apiKey: apiKey});
    console.log('stormpath client created');
    callback(null);
  });
};

function setApplication(callback) {
  console.log("function " + "setApplication" + " called");
  client.getApplications({
      name: spConfig.SP_APP_NAME
  }, function(err, applications) {
      console.log('function call');
      if (err) {
          console.log("client error: " + err);
          throw err;
      }
      spApp = applications.items[0];
      callback(null);
  });
}

function launchServer(callback) {
  console.log("function " + "launchServer" + " called");

  app.locals.spApp = spApp;
  app.use(morgan('combined'));
  app.use(stormpathExpress.init(app, {
       apiKeyFile: './config/stormpath_apikey.properties',
       application: security.stormpath_application_url,
       secretKey: security.stormpath_secret_key
   }));
  mongoose.connect(db.url);
  app.use(bodyParser.urlencoded({ extended: true }));
  routes.addAPIRouter(app, mongoose, stormpathExpress);
  // bad urls
  app.use(function(req, res, next){
     res.status(404);
     res.json({ error: 'Invalid URL' });
  });

  app.listen(port);
  callback(null);
}

async.series([setClient, setApplication, launchServer]);

exports = module.exports = app;
