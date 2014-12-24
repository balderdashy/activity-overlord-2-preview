/**
 * Module dependencies
 */

var assert = require('assert');
var request = require('request');


describe('UserController.find', function (){


  describe('sending request to `GET /users`', function (){

    it('should respond with 401 Unauthorized', function (done) {
      request.get('http://localhost:1337/users', function (err, clientRes, body){
        assert(!err,err);
        assert.equal(clientRes.statusCode, 401);
        done();
      });
    });

  });

});
