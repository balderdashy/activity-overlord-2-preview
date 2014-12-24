/**
 * Module dependencies
 */

var sails = require('sails');


before(function (done){
  sails.lift({
    log: { level: 'warn' },
    hooks: { grunt: false }
  }, done);
});

after(function (done){
  sails.lower(done);
});
