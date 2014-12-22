/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  create: function(req, res, next) {

    // Check for email and password in params sent via the form, if none
    // redirect the browser back to the sign-in form.
    if (!req.param('email') || !req.param('password')) {
      // return next({err: ["Password doesn't match password confirmation."]});

      var usernamePasswordRequiredError = [{
        name: 'usernamePasswordRequired',
        message: 'You must enter both a username and password.'
      }]

      // Remember that err is the object being passed down (a.k.a. flash.err), whose value is another object with
      // the key of usernamePasswordRequiredError
      // req.session.flash = {
      //     err: usernamePasswordRequiredError
      // }

      // res.redirect('/session/new');
      // return;

      res.send(404, usernamePasswordRequiredError);

      // Why do you need this return?  Because res.send doesn't stop the function from continuing to run.
      return;
    }

    // Try to find the user by there email address. 
    // findOneByEmail() is a dynamic finder in that it searches the model by a particular attribute.
    // User.findOneByEmail(req.param('email')).done(function(err, user) {
    User.findOneByEmail(req.param('email'), function foundUser(err, user) {

      if (err) return next(err);

      // If no user is found...
      if (!user) {
        var noAccountError = [{
            name: 'noAccount',
            message: 'The email address ' + req.param('email') + ' not found.'
          }]
          // req.session.flash = {
          //     err: noAccountError
          // }

        res.send(404, noAccountError);
        return;
        // res.redirect('/session/new');
        // res.send('The email address ' + req.param('email') + ' not found.');
        // res.send(200);


      }

      // Compare password from the form params to the encrypted password of the user found.
      bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid) {
        if (err) return next(err);

        // If the password from the form doesn't match the password from the database...
        if (!valid) {
          var usernamePasswordMismatchError = [{
              name: 'usernamePasswordMismatch',
              message: 'Invalid username and password combination.'
            }]
            // req.session.flash = {
            //     err: usernamePasswordMismatchError
            // }
          res.send(404, usernamePasswordMismatchError);
          return;
        }

        // Log user in
        req.session.authenticated = true;
        req.session.User = user;

        // res.send(200, user);

        // res.send()
        // res.location('/#');
        // res.view('angular/index', { layout: 'angular-layout'});
        res.redirect('/');


        // Change status to online
        // user.online = true;
        // user.save(function(err, user) {
        //     if (err) return next(err);


        // Inform other sockets (e.g. connected sockets that are subscribed) that this user is now logged in
        // User.publishUpdate(user.id, {
        //     loggedIn: true,
        //     id: user.id,
        //     name: user.name,
        //     action: ' has logged in.'
        // });

        // If the user is also an admin redirect to the user list (e.g. /views/user/index.ejs)
        // This is used in conjunction with config/policies.js file
        // if (req.session.User.admin) {
        //     res.redirect('/user');
        //     return;
        // }

        //Redirect to their profile page (e.g. /views/user/show.ejs)
        // res.redirect('/user/show/' + user.id);
        // });
      });
    });
  },

  destroy: function(req, res, next) {

    User.findOne(req.session.User.id, function foundUser(err, user) {

      var userId = req.session.User.id;

      if (user) {
        // The user is "logging out" (e.g. destroying the session) so change the online attribute to false.
        User.update(userId, {
          online: false
        }, function(err) {
          if (err) return next(err);

          // // Inform other sockets (e.g. connected sockets that are subscribed) that the session for this user has ended.
          // User.publishUpdate(userId, {
          //     loggedIn: false,
          //     id: userId,
          //     name: user.name,
          //     action: ' has logged out.'
          // });

          // Wipe out the session (log out)
          req.session.destroy();

          // req.session = undefined;

          res.redirect('/');
          // res.view('static/index', { layout: 'layout'});
          //                    res.send(200);
          // return;

        });
      } else {

        // Wipe out the session (log out)
        req.session.destroy();
        // req.session = undefined;

        res.send(200);
        // return;

      }
    });
  }

};