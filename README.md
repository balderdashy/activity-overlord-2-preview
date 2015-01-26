# angularactivity

A rough preview of [Activity Overlord 2.0](https://github.com/irlnathan/activityoverlord20) (a [Sails](http://sailsjs.org) application) using Angular for the front-end.
It includes login, signup, realtime notifications, and presence in Sails... _without_ blueprints this time.  (See Irl's screencasts for the full tutorial, starting with blueprints.)

### How do I start this thing?

This app is set up out of the box to use Mongo and Redis- you'll need to run `mongod` and `redis-server` in two separate terminal tabs/windows before running `sails lift` in a third terminal tab/window to start it up.

Alternatively, just comment out `adapter` in `config/session.js` and change `connection: 'someMongodbServer'` in `config/models.js` with `connection: 'localDiskDb'`.

### How does the "presence" work?

This app uses mouse movements to inform the server whether a user is at her keyboard or not.  This would be easy to expand to other DOM events like keypresses and window focus.

### How do I log in as an admin?

To log in as the built-in default admin user, use `a@a.com`/`123456`


### License
MIT
&copy; 2015 Mike McNeil and Irl Nathan
