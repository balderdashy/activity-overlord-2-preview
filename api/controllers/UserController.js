/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  // This loads the sign-up page --> new.ejs
  'new': function(req, res) {
    res.view({
      layout: 'public-layout'
    });
  },


  // Create a new user
  create: function(req, res) {

    var userObj = {
      name: req.param('name'),
      title: req.param('title'),
      email: req.param('email'),
      password: req.param('password'),
      confirmation: req.param('confirmation')
    };

    // Create a User with the params sent from
    // the sign-up form --> new.ejs
    User.create(userObj, function userCreated(err, user) {

      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        };

        // If error redirect back to sign-up page
        return res.redirect('/user/new');
      }

      // Log user in
      req.session.authenticated = true;
      req.session.User = user;

      // Change status to online
      user.online = true;
      user.save(function(err, user) {

        //!!!!!Not sure how to handle this error??

        // add the action attribute to the user object for the flash message.
        user.action = ' signed-up and logged-in.';

        // Let other subscribed sockets know that the user was created.
        User.publishCreate(user);

        // After successfully creating the user
        // redirect to the show action
        // From ep1-6: //res.json(user);

        // res.redirect('/user/show/' + user.id);

        res.redirect('/');
      });
    });
  }

};
