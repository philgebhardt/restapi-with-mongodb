var mongoose = require('mongoose');
var express = require('express');
var emailUtils = require('./email_utils.js');

var userSchema = new mongoose.Schema({
         active: Boolean,
         email: { type: String, trim: true, lowercase: true },
         givenName: { type: String, trim: true },
         surname: { type: String, trim: true },
         sp_api_key_id: { type: String, trim: true },
         sp_api_key_secret: { type: String, trim: true },
         subs: { type: [mongoose.Schema.Types.ObjectId], default: [] },
         created: { type: Date, default: Date.now },
         lastLogin: { type: Date, default: Date.now },
     },
     { collection: 'user' }
);

userSchema.statics.findByEmail = function (email, callback) {
  this.find({ email: new RegExp(email, 'i') }, callback);
}

userSchema.index({email : 1}, {unique:true});
userSchema.index({sp_api_key_id : 1}, {unique:true});

var UserModel = mongoose.model( 'User', userSchema );

var feedSchema = new mongoose.Schema({
         feedURL: { type: String, trim:true },
         link: { type: String, trim:true },
         description: { type: String, trim:true },
         state: { type: String, trim:true, lowercase:true, default: 'new' },
         createdDate: { type: Date, default: Date.now },
         modifiedDate: { type: Date, default: Date.now },
     },
     { collection: 'feed' }
);

feedSchema.index({feedURL : 1}, {unique:true});
feedSchema.index({link : 1}, {unique:true, sparse:true});

var FeedModel = mongoose.model( 'Feed', feedSchema );

var feedEntrySchema = new mongoose.Schema({
         description: { type: String, trim:true },
         title: { type: String, trim:true },
         summary: { type: String, trim:true },
         entryID: { type: String, trim:true },
         publishedDate: { type: Date },
         link: { type: String, trim:true  },
         feedID: { type: mongoose.Schema.Types.ObjectId },
         state: { type: String, trim:true, lowercase:true, default: 'new' },
         created: { type: Date, default: Date.now },
     },
     { collection: 'feedEntry' }
);

feedEntrySchema.index({entryID : 1});
feedEntrySchema.index({feedID : 1});

var FeedEntryModel = mongoose.model( 'FeedEntry', feedEntrySchema );

var userFeedEntrySchema = new mongoose.Schema({
         userID: { type: mongoose.Schema.Types.ObjectId },
         feedEntryID: { type: mongoose.Schema.Types.ObjectId },
         feedID: { type: mongoose.Schema.Types.ObjectId },
         read : { type: Boolean, default: false },
     },
     { collection: 'userFeedEntry' }
 );

userFeedEntrySchema.index({userID : 1, feedID : 1, feedEntryID : 1, read : 1});
var UserFeedEntryModel = mongoose.model('UserFeedEntry', userFeedEntrySchema );

exports.addAPIRouter = function(app, mongoose, stormpath) {

  console.log('Adding Routes');

  app.get('/*', function(req, res, next) {
    console.log('received request: GET');
  	res.contentType('application/json');
  	next();
  });
  app.post('/*', function(req, res, next) {
    console.log('received request: POST');
  	res.contentType('application/json');
  	next();
  });
  app.put('/*', function(req, res, next) {
    console.log('received request: PUT');
  	res.contentType('application/json');
  	next();
  });
  app.delete('/*', function(req, res, next) {
    console.log('received request: DELETE');
  	res.contentType('application/json');
  	next();
  });

  var router = express.Router();

 	router.post('/user/enroll', function(req, res) {

    account = req.body;
    if(!account['givenName']) {
      res.status(400);
      res.json({'error' : 'Undefined First Name'});
    } else if(!emailUtils.isValid(account.email)) {
      res.status(400);
      res.json({'error' : 'Invalid Email'})
    } else {
        UserModel.findByEmail(account.email, function(err, accounts) {
          if(err) {
            console.log('error getting accounts: ' + err);
          } else if(accounts.length) {
            console.log("user already exists with email: " + accounts[0].email);
            res.status(409);
            res.json({error : 'Account with that email already exists.  Please choose another email.'});
          } else {
            var user = new UserModel(account);
            app.locals.spApp.createAccount(account, function(err, account) {
              if(err) throw err;
              account.createApiKey(function(err,apiKey){
                console.log('apiKey created: ' + apiKey.toString());
                user.sp_api_key_id = apiKey.id;
                user.sp_api_key_secret = apiKey.secret;
                user.save(function(err) {
                  if(err) {
                    console.log('error saving new user to db: ' + err);
                    throw err;
                  }
                  console.log("account created: " + account.email);
                  res.status(201);
                  res.json(account);
                });
              });
            });
          }
      });
    }
 	});

 	router.get('/feeds', stormpath.apiAuthenticationRequired, function(req, res) {
 		console.log('Router for /feeds');
 		// ...
     res.send(JSON.stringify({}));
 	});

 	router.put('/feeds/subscribe', stormpath.apiAuthenticationRequired, function(req, res) {
 		console.log('Router for /feeds');
 		// ...
     res.send(JSON.stringify({}));
 	});

  app.use('/api/v1.0', router);
};
