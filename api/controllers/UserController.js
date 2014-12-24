/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {


  comeOnline: function (req, res) {

    // Flag this user as online.
    User.update(req.session.me, {
      online: true
    }).exec(function (err){
      if (err) return res.negotiate(err);

      // Tell anyone who is allowed to hear about it that this user is online.
      User.publishUpdate(req.session.me, {
        online: true
      });

      return res.ok();
    });
  },


  /**
   * This action is mainly here to demonstrate exactly what the
   * pubsub/sockets part of the `find` blueprint does.
   */
  watchAndSubscribeToAll: function (req, res){

    // "Watch" the User model to hear about `publishCreate`'s.
    User.watch(req);

    // We only find the users here so we can subscribe to them.
    User.find().exec(function (err, users) {
      if (err) return res.negotiate(err);

      // "Subscribe" to each User record to hear about
      // `publishUpdate`'s and `publishDestroy`'s
      _.each(users, function (user) {
        User.subscribe(req, user.id);
      });

      return res.ok();
    });
  },


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
    })(function (err, attributeValsToSet){
      if (err) return res.negotiate(err);

      User.update(req.session.me, attributeValsToSet).exec(function (err){
        if (err) return res.negotiate(err);

        // Let all connected sockets who were allowed to subscribe to this user
        // record know that there has been a change.
        User.publishUpdate(req.session.me, {
          name: attributeValsToSet.name,
          email: attributeValsToSet.email,
          title: attributeValsToSet.title
        });

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
    })(function (err, attributeValsToSet){
      if (err) return res.negotiate(err);

      User.update(req.param('id'), attributeValsToSet).exec(function (err){
        if (err) return res.negotiate(err);

        // Let all connected sockets who were allowed to subscribe to this user
        // record know that there has been a change.
        User.publishUpdate(req.param('id'), {
          name: attributeValsToSet.name,
          email: attributeValsToSet.email,
          title: attributeValsToSet.title,
          admin: attributeValsToSet.admin
        });

        return res.ok();
      });
    });

  },



  /**
   * Check the provided email address and password, and if they
   * match a real user in the database, sign in to Activity Overlord.
   */
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

        // The user is "logging in" (e.g. establishing a session)
        // so change the `hasSession` attribute to true.
        User.update(user.id, {
          hasSession: true
        }, function(err) {
          if (err) return res.negotiate(err);

          // Inform other sockets (e.g. connected sockets that are subscribed)
          // that this user has logged in.
          User.publishUpdate(user.id, {
            hasSession: true
          });

          // Store user id in the user session
          req.session.me = user.id;

          // All done- let the client know that everything worked.
          return res.ok();
        });

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
      // so change the `hasSession` attribute to false.
      User.update(user.id, {
        hasSession: false
      }, function(err) {
        if (err) return res.negotiate(err);

        // Inform other sockets (e.g. connected sockets that are subscribed)
        // that this user has logged out.
        User.publishUpdate(user.id, {
          hasSession: false
        });

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
