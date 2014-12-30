/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {


  /**
   * Normally if unspecified, pointing a route at this action will cause Sails
   * to use its built-in blueprint action.  We're overriding that here.
   */
  find: function (req, res) {

    // "Watch" the User model to hear about `publishCreate`'s.
    User.watch(req);

    // We only find the users here so we can subscribe to them.
    User.find().exec(function (err, users) {
      if (err) return res.negotiate(err);

      // "Subscribe" the socket.io socket (i.e. browser tab)
      // to each User record to hear about subsequent `publishUpdate`'s
      // and `publishDestroy`'s.
      _.each(users, function (user) {
        User.subscribe(req, user.id);
      });

      // Before responding with the array of users, loop through and
      // add a property called "isActive" if the user was active within the last
      // 15 seconds.  Front-end code can use this as the initial state
      // (i.e. so when you see the list of users, they are not all initially inactive).
      _.each(users, function (user){

        var serverNow = new Date();
        if (user.lastActive.getTime() > (serverNow.getTime() - (15*1000))) {
          user.msUntilInactive = (user.lastActive.getTime()+15*1000) - serverNow.getTime();
          if (user.msUntilInactive < 0) {
            user.msUntilInactive = 0;
          }
        }

        // We also delete the `lastActive` property so as to avoid confusion.
        // (i.e. we're using msUntilInactive because the server could be in Beijing,
        //  but a user's browser might be in California)
        delete user.lastActive;
      });

      return res.json(users);
    });
  },



  /**
   * This action is the first endpoint hit by logged-in sockets after they connect.
   * This is implemented by our web front-end in:
   * `assets/js/activity-overlord/ui-controls/DashboardCtrl.js`
   */
  comeOnline: function (req, res) {

    // Look up the currently-logged-in user
    User.findOne(req.session.me).exec(function (err, user) {
      if (err) return res.negotiate(err);
      if (!user) {
        return res.negotiate(new Error('User associated with disconnecting socket no longer exists.'));
      }

      // Update the `lastActive` timestamp for the user to be the server's local time.
      User.update(user.id, {
        lastActive: new Date()
      }).exec(function (err){
        if (err) return res.negotiate(err);


        // Tell anyone who is allowed to hear about it
        User.publishUpdate(req.session.me, {
          justBecameActive: true,
          msUntilInactive: 15*1000,
          name: user.name
        });

        return res.ok();
      });
    });
  },






  /**
   * Update your own profile
   * ("you" being the currently-logged in user, aka `req.session.me`)
   */
  updateMyProfile: function (req, res) {

    (function _prepareAttributeValuesToSet(allParams, cb){
      var setAttrVals = {};

      if (allParams.name) {
        setAttrVals.name = allParams.name;
      }
      if (allParams.title) {
        setAttrVals.title = allParams.title;
      }
      if (allParams.email) {
        setAttrVals.email = allParams.email;
      }

      // Encrypt password if necessary
      if (!allParams.password) {
        return cb(null, setAttrVals);
      }
      require('machinepack-passwords').encryptPassword({password: allParams.password}).exec({
        error: function (err){
          return cb(err);
        },
        success: function (encryptedPassword){
          setAttrVals.encryptedPassword = encryptedPassword;
          return cb(null, setAttrVals);
        }
      });
    })(req.allParams(), function (err, attributeValsToSet){
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

        // Respond with user's data so that UI can be updated.
        return res.ok({
          name: attributeValsToSet.name,
          email: attributeValsToSet.email,
          title: attributeValsToSet.title
        });
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

    (function _prepareAttributeValuesToSet(allParams, cb){
      var setAttrVals = {};

      if (allParams.name) {
        setAttrVals.name = allParams.name;
      }
      if (allParams.title) {
        setAttrVals.title = allParams.title;
      }
      if (allParams.email) {
        setAttrVals.email = allParams.email;
      }

      // In this case, we use _.isUndefined (which is pretty much just `typeof X==='undefined'`)
      // because the parameter could be sent as `false`, which we **do** care about.
      if ( !_.isUndefined(allParams.admin) ) {
        setAttrVals.admin = allParams.admin;
      }

      // Encrypt password if necessary
      if (!allParams.password) {
        return cb(null, setAttrVals);
      }
      require('machinepack-passwords').encryptPassword({password: allParams.password}).exec({
        error: function (err){
          return cb(err);
        },
        success: function (encryptedPassword) {
          setAttrVals.encryptedPassword = encryptedPassword;
          return cb(null, setAttrVals);
        }
      });
    })(req.allParams(), function (err, attributeValsToSet){
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
      require('machinepack-passwords').checkPassword({
        passwordAttempt: req.param('password'),
        encryptedPassword: user.encryptedPassword
      }).exec({

        error: function (err){
          return res.negotiate(err);
        },

        // If the password from the form params doesn't checkout w/ the encrypted
        // password from the database...
        incorrect: function (){
          return res.notFound();
        },

        success: function (){

          // The user is "logging in" (e.g. establishing a session)
          // so update the `lastLoggedIn` attribute.
          User.update(user.id, {
            lastLoggedIn: new Date()
          }, function(err) {
            if (err) return res.negotiate(err);

            // Store user id in the user session
            req.session.me = user.id;

            // All done- let the client know that everything worked.
            return res.ok();
          });
        }
      });
    });
  },




  /**
   * Log out of Activity Overlord.
   * (wipes `me` from the sesion)
   */
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

      // Wipe out the session (log out)
      req.session.me = null;

      // Inform anyone who's allowed to hear about it that this user has logged out.
      User.publishUpdate(user.id, {
        justLoggedOut: true,
        name: user.name
      });

      // Either send a 200 OK or redirect to the home page
      return res.backToHomePage();

    });
  },




  /**
   * Sign up for a user account.
   * (creates a new user, and also logs in as that new user)
   */
  signup: function(req, res) {

    // Encrypt the password provided by the user
    require('machinepack-passwords').encryptPassword({
      password: req.param('password')
    }).exec({
      error: function (err) {
        return res.negotiate(err);
      },
      success: function (encryptedPassword) {
        require('machinepack-gravatar').getImageUrl({
          emailAddress: req.param('email')
        }).exec({
          error: function(err){
            return res.negotiate(err);
          },
          success: function(gravatar_url) {

        // Create a User with the params sent from
        // the sign-up form --> new.ejs
        User.create({
          name: req.param('name'),
          title: req.param('title'),
          email: req.param('email'),
          encryptedPassword: encryptedPassword,
          lastLoggedIn: new Date(),
          gravatarUrl: gravatar_url
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
            lastLoggedIn: newUser.lastLoggedIn
          });

          // Send back the id of the new user
          return res.json({
            id: newUser.id
          });

        });
      }
    });

      }
    });
  }




};
