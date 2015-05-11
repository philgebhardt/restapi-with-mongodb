SP_APP_NAME = 'My Application';
TU_EMAIL_REGEX = 'testuser*';
var async = require('async');
var testConfig = require('../config/test_config.js');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var stormpath = require('stormpath');
var apiKeyFilePath = 'config/stormpath_apikey.properties';
var client;

stormpath.loadApiKey(apiKeyFilePath, function apiKeyFileLoaded(err, apiKey) {
  if (err) throw err;
  client = new stormpath.Client({apiKey: apiKey});
});

function connectDB(callback) {
    mongoClient.connect(testConfig.dbUrl, function(err, db) {
        assert.equal(null, err);
        reader_test_db = db;
        console.log("Connected correctly to server");
        callback(0);
    });
}

function dropUserCollection(callback) {
    console.log("dropUserCollection");
    user = reader_test_db.collection('user');
    if (undefined != user) {
        user.drop(function(err, reply) {
            console.log('user collection dropped');
            callback(0);
        });
    } else {
        callback(0);
    }
}

function dropUserFeedEntryCollection(callback) {
  console.log("dropUserFeedEntryCollection");
  user_feed_entry = reader_test_db.collection('user_feed_entry');
  if (undefined != user_feed_entry) {
      user_feed_entry.drop(function(err, reply) {
          console.log('user_feed_entry collection dropped');
          callback(0);
      });
  } else {
      callback(0);
  }
}

function getApplication(callback) {
    console.log("getApplication");
    client.getApplications({
        name: SP_APP_NAME
    }, function(err, applications) {
        // console.log(applications);
        if (err) {
            console.log("Error in getApplications: " + err);
            throw err;
        }
        app = applications.items[0];
        callback(0);
    });
}

function deleteTestAccounts(callback) {
    app.getAccounts({
        email: TU_EMAIL_REGEX
    }, function(err, accounts) {
        if (err) throw err;
        accounts.items.forEach(function deleteAccount(account) {
            console.log('deleting user: ' + account['email']);
            account.delete(function deleteError(err) {
                if (err) throw err;
            });
        });
        callback(0);
    });
}

function closeDB(callback) {
  reader_test_db.close();
}

async.series([connectDB, dropUserCollection, dropUserFeedEntryCollection, dropUserFeedEntryCollection, getApplication, deleteTestAccounts, closeDB]);
