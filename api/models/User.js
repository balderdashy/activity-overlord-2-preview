/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
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

    // Whether or not the user is currently online
    // (i.e. has a browser tab or mobile app open on Activity Overlord)
    online: {
      type: 'boolean',
      defaultsTo: false
    },

    // Whether or not the user has a session
    // (i.e. they logged in recently enough without logging out.
    // Note that this never expires-- so it is just an approximation)
    hasSession: {
      type: 'boolean',
      defaultsTo: false
    },

    // Whether or not the user has administrator privileges
    admin: {
      type: 'boolean',
      defaultsTo: false
    }
  }

};
