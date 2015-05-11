TU1_FN = "Test";
TU1_LN = "User1";
TU1_EMAIL = "testuser1@example.com";
TU1_PW = "testUser123";
TU_EMAIL_REGEX = 'testuser*';
SP_APP_NAME = 'Reader Test';

var frisby = require('frisby');
var tc = require('../config/test_config');

frisby.create('POST missing firstName')
    .post(tc.url + '/user/enroll',
          { 'surname' : TU1_LN,
            'email' : TU1_EMAIL,
            'password' : TU1_PW })
    .expectStatus(400)
    .expectHeader('Content-Type', 'application/json; charset=utf-8')
    .expectJSON({'error' : 'Undefined First Name'})
    .toss();

frisby.create('POST invalid email address')
    .post(tc.url + '/user/enroll',
          { 'givenName' : TU1_FN,
            'surname' : TU1_LN,
            'email' : "invalid.email",
            'password' : 'testUser' })
    .expectStatus(400)
    .expectHeader('Content-Type', 'application/json; charset=utf-8')
    .expectJSONTypes({'error' : String})
    .toss();
