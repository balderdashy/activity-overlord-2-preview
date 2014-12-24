/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {


  /**
   * Update your own profile ("you" being the currently-logged in user)
   */
  updateMyProfile: function (req, res) {
    (function (cb){
      var setAttrVals = {};

      if (req.param('name')) {
        setAttrVals.name = req.param('name');
      }
      if (req.param('title')) {
        setAttrVals.title = req.param('title');
      }
      if (req.param('email')) {
        setAttrVals.email = req.param('email');
      }

      // Encrypt password if necessary
      if (!req.param('password')) {
        return cb(null, setAttrVals);
      }
      require('bcrypt').hash(req.param('password'), 10, function passwordEncrypted(err, encryptedPassword) {
        if (err) return cb(err);
        setAttrVals.encryptedPassword = encryptedPassword;
        return cb(null, setAttrVals);
      });
    })(function (err, setAttrVals){
      if (err) return res.negotiate(err);

      // TODO: realtime bit

      User.update(req.session.me, setAttrVals).exec(function (err){
        if (err) return res.negotiate(err);
        return res.ok();
      });
    });
  },



  /**
   * Update any user.
   */
  update: function (req, res) {

    if (!req.param('id')) {
      return res.badRequest('`id` of user to edit is required');
    }

    (function (cb){
      var setAttrVals = {};

      if (req.param('name')) {
        setAttrVals.name = req.param('name');
      }
      if (req.param('title')) {
        setAttrVals.title = req.param('title');
      }
      if (req.param('email')) {
        setAttrVals.email = req.param('email');
      }

      // In this case, we use _.isUndefined (which is pretty much just `typeof X==='undefined'`)
      // because the parameter could be sent as `false`, which we **do** care about.
      if ( !_.isUndefined(req.param('admin')) ) {
        setAttrVals.admin = req.param('admin');
      }

      // Encrypt password if necessary
      if (!req.param('password')) {
        return cb(null, setAttrVals);
      }
      require('bcrypt').hash(req.param('password'), 10, function passwordEncrypted(err, encryptedPassword) {
        if (err) return cb(err);
        setAttrVals.encryptedPassword = encryptedPassword;
        return cb(null, setAttrVals);
      });
    })(function (err, setAttrVals){
      if (err) return res.negotiate(err);

      // TODO: realtime bit

      User.update(req.param('id'), setAttrVals).exec(function (err){
        if (err) return res.negotiate(err);
        return res.ok();
      });
    });

  },



  login: function (req, res) {

    req.validate({
      email: 'string',
      password: 'string'
    });

    // Try to look up user using the provided email address
    User.findOne({
      email: req.param('email')
    }, function foundUser(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.notFound();

      // Compare password attempt from the form params to the encrypted password
      // from the database (`user.password`)
      require('bcrypt').compare(req.param('password'), user.encryptedPassword, function(err, valid) {
        if (err) return res.negotiate(err);

        // If the password from the form params doesn't checkout w/ the encrypted
        // password from the database...
        if (!valid) {
          return res.notFound();
        }

        // Store user id in the user session
        req.session.me = user.id;

        // All done- let the client know that everything worked.
        return res.ok();

      });// </bcrypt.compare>

    });
  },


  logout: function (req, res) {

    // Look up the user record from the database which is
    // referenced by the id in the user session (req.session.me)
    User.findOne(req.session.me, function foundUser(err, user) {
      if (err) return res.negotiate(err);

      // If session refers to a user who no longer exists, still allow logout.
      if (!user) {
        sails.log.warn('Session refers to a user who no longer exists.');
        return res.backToHomePage();
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

        // Either send a 200 OK or redirect to the home page
        return res.backToHomePage();

      });

    });
  },


  // Sign up for a user account (create a new user)
  signup: function(req, res) {

    // Encrypt the password provided by the user
    require('bcrypt').hash(req.param('password'), 10, function passwordEncrypted(err, encryptedPassword) {
      if (err) return res.negotiate(err);

      // Create a User with the params sent from
      // the sign-up form --> new.ejs
      User.create({
        name: req.param('name'),
        title: req.param('title'),
        email: req.param('email'),
        encryptedPassword: encryptedPassword,
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
        User.publishCreate({
          id: newUser.id,
          name: newUser.name,
          title: newUser.title,
          email: newUser.email,
          online: true
        });

        // Send back the id of the new user
        return res.json({
          id: newUser.id
        });

      });
    });
  }

};
