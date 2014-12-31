/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  ////////////////////////////////////////////////////////////
  // Server-rendered HTML webpages
  ////////////////////////////////////////////////////////////
  'GET /': 'PageController.showHomePage',
  'GET /signup': {view: 'signup'},



  ////////////////////////////////////////////////////////////
  // JSON API
  ////////////////////////////////////////////////////////////

  // User enrollment + authentication
  'POST /signup': 'UserController.signup',
  'PUT /login': 'UserController.login',
  '/logout': 'UserController.logout',

  // Flag self as online
  'PUT /me/online': 'UserController.comeOnline',

  // Update my profile
  'PUT /me': 'UserController.updateMyProfile',

  // List users (also watch and subscribe to all)
  'GET /users': 'UserController.find',

  // Get user profile
  'GET /users/:id': 'UserController.findOne',

  // Update a user's profile data
  'PUT /users/:id': 'UserController.update',

  // Destroy a user
  'DELETE /users/:id': 'UserController.destroy'

};
