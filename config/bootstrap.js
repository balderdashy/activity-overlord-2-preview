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

        // ****************************************

        require('machinepack-passwords').encryptPassword({
          password: '123456'
        }).exec({
          error: function (err) {
            console.log(err);
          },
          success: function (encryptedPassword) {

            // Create a User with the params sent from
            // the sign-up form --> new.ejs
            User.create({
              name: 'John Galt',
              title: 'Admin',
              email: 'a@a.com',
              admin: true,
              encryptedPassword: encryptedPassword,
              lastLoggedIn: new Date()
            }, function userCreated(err, newUser) {
              if (err) {
                cb(err);
              }
              cb();
            });
          }
        });

        // ****************************************
        
      });
    }
  )
};