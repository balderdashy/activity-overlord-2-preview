/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  // User is not authenticated.
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  if (!req.session.me) {
    return res.backToHomePage(401);
  }

  User.findOne(req.session.me).exec({
    // switchback here as an example
    error: function (err){

    },

    success: function (user){
      if (!user) {
        return res.backToHomePage(404);
      }
      if (!user.admin) {
        return res.backToHomePage(403);
      }

      // User is allowed, proceed to the next policy,
      // or if this is the last policy, the controller
      return next();
    }
  });
};
