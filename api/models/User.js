/**
 * User.js
 *
 * @description :: Each record in this model represents a user's account in Activity Overlord.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    // The user's full name
    // e.g. Jon Snow
    name: {
      type: 'string',
      required: true
    },

    // The user's title at their job (or something)
    // e.g. Lord Commander, Night's Watch
    title: {
      type: 'string'
    },

    // The user's email address
    // e.g. jonsnow@winterfell.net
    email: {
      type: 'string',
      email: true,
      required: true,
      unique: true
    },

    // The encrypted password for the user
    // e.g. asdgh8a249321e9dhgaslcbqn2913051#T(@GHASDGA
    encryptedPassword: {
      type: 'string'
    },

    // Number of sockets connected for this user
    // (i.e. number of browser tab or mobile app open, logged in, and pointed at Activity Overlord)
    numSocketsConnected: {
      type: 'integer',
      defaultsTo: 0
    },

    // The timestamp when the the user last logged in
    lastLoggedIn: {
      type: 'date'
    },

    // Whether or not the user has administrator privileges
    admin: {
      type: 'boolean',
      defaultsTo: false
    },

    // url for gravatar
    gravatarUrl: {
      type: 'string'
    }
  }

};
