/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {


  logout: function (req, res) {

    // Look up the user record from the database which is
    // referenced by the id in the user session (req.session.me)
    User.findOne(req.session.me, function foundUser(err, user) {
      if (err) return res.negotiate(err);
      if (!user) {
        return res.serverError('Session refers to a user who no longer exists.');
      }

      // The user is "logging out" (e.g. destroying the session)
      // so change the online attribute to false.
      User.update(user.id, {
        online: false
      }, function(err) {
        if (err) return res.negotiate(err);

        // TODO
        // Inform other sockets (e.g. connected sockets that are subscribed)
        // that the session for this user has ended.
        // User.publishUpdate(userId, {
        //     loggedIn: false,
        //     id: userId,
        //     name: user.name,
        //     action: ' has logged out.'
        // });

        // Wipe out the session (log out)
        req.session.me = null;

        if (req.wantsJSON) {
          return res.ok();
        }
        return res.redirect('/');

      });

    });
  },


  // Sign up for a user account (create a new user)
  signup: function(req, res) {

    // Validate that the required parameters are the right type.
    // req.validate({
    //   name: {type: 'string'},
    //   password: {type: 'string'},
    //   email: {type: 'string'},
    //   title: {type: 'string'}
    // });

    // Create a User with the params sent from
    // the sign-up form --> new.ejs
    User.create({
      name: req.param('name'),
      title: req.param('title'),
      email: req.param('email'),
      password: req.param('password'),
      online: true
    }, function userCreated(err, newUser) {
      if (err) {

        // If this is a uniqueness error about the email attribute,
        // send back an easily parseable status code.
        if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0] && err.invalidAttributes.email[0].rule === 'unique'){
          return res.emailAddressInUse();
        }

        // Otherwise, send back something reasonable as our error response.
        return res.negotiate(err);
      }

      // Log user in
      req.session.me = newUser.id;

      // Let other subscribed sockets know that the user was created.
      User.publishCreate(newUser);

      return res.ok({
        id: newUser.id
      });
    });
  }

};
