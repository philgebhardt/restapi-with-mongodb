TEST_USERS = [{'fn' : 'Test', 'ln' : 'User1',
               'email' : 'testuser1@example.com', 'pwd' : 'testUser123'},
              {'fn' : 'Test', 'ln' : 'User2',
               'email' : 'testuser2@example.com', 'pwd' : 'testUser123'},
              {'fn' : 'Test', 'ln' : 'User3',
               'email' : 'testuser3@example.com', 'pwd' : 'testUser123'}]

SP_APP_NAME = 'My Application';

var frisby = require('frisby');
var tc = require('../config/test_config');

// {
//   givenName: 'Joe',
//   surname: 'Stormtrooper',
//   username: 'tk421',
//   email: 'tk421@stormpath.com',
//   password: 'Changeme1',
//   customData: {
//     favoriteColor: 'white',
//   }

TEST_USERS.forEach(function createUser(user, index, array) {
    frisby.create('POST enroll user ' + user.email)
        .post(tc.url + '/user/enroll',
              { 'givenName' : user.fn,
                'surname' : user.ln,
                'email' : user.email,
                'password' : user.pwd })
        .expectStatus(201)
        .expectHeader('Content-Type', 'application/json; charset=utf-8')
        .expectJSON({ 'givenName' : user.fn,
                      'surname' : user.ln,
                      'email' : user.email })
        .toss()
});

frisby.create('POST enroll duplicate user ')
    .post(tc.url + '/user/enroll',
          { 'givenName' : TEST_USERS[0].fn,
            'surname' : TEST_USERS[0].ln,
            'email' : TEST_USERS[0].email,
            'password' : TEST_USERS[0].pwd })
    .expectStatus(409)
    .expectHeader('Content-Type', 'application/json; charset=utf-8')
    .expectJSON({'error' : 'Account with that email already exists.  Please choose another email.'})
    .toss();
