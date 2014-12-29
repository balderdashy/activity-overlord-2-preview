/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)


  User.update({}, {
      numSocketsConnected: 0
    },
    function userUpdated(err, users) {
      if (err) {
        console.log(err);
      } else {
        // console.log(users);
      }

      User.findOne({
        admin: true
      }).exec(function(err, admin) {
        if (err) return cb(err);
        if (admin) {
          return cb(null, admin);
        }

        User.create({
          name: 'admin',
          title: 'The Administrator',
          email: 'a@a.com',
          password: '123456',
          admin: true
        }).exec(function(err, adminUser) {
          if (err) return cb(err);
          console.log("admin user created");
          cb();
        });
      });
    }
  )
};