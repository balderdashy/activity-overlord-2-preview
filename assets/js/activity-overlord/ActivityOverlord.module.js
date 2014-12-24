angular.module('ActivityOverlord', ['ngRoute']);
angular.module('ActivityOverlord').config(['$routeProvider', function($routeProvider) {

  $routeProvider

  // #/    (i.e. ng-view's "home" state)
  .when('/', {
    templateUrl: 'templates/admin-dashboard-home.html',
    // If the current user is an admin, "redirect" (client-side) to `#/users`.
    controller: ['$location', function($location) {
      if (window.SAILS_LOCALS.me.isAdmin) {

        // Instead of:
        // window.location.hash = '#/users';

        // We can do it the angular way:
        // (to avoid a bunch of weird digest loop errors)
        $location.path('/users');
        $location.replace();
        return;
      }
    }]
  })


  // #/users
  .when('/users', {
    templateUrl: 'templates/admin-dashboard-users.html',
    // Don't allow non-admins to access #/users.
    controller: ['$location', function($location) {
      if (!window.SAILS_LOCALS.me.isAdmin) {
        $location.path('/');
        $location.replace();
        return;
      }
    }]
  })


  // #/users/:id
  .when('/users/:id', {
    templateUrl: 'templates/admin-dashboard-profile.html',
    // Don't allow non-admins to access #/users/:id.
    controller: ['$location', function($location) {
      if (!window.SAILS_LOCALS.me.isAdmin) {
        $location.path('/');
        $location.replace();
        return;
      }
    }]
  })

  // #/users/:id/edit
  .when('/users/:userId/edit', {
    templateUrl: 'templates/admin-dashboard-edit-user.html',
    // Don't allow non-admins to access #/users/:id/edit.
    controller: ['$location', function($location) {
      if (!window.SAILS_LOCALS.me.isAdmin) {
        $location.path('/');
        $location.replace();
        return;
      }
    }]
  })


  // #/?????     (i.e. anything else)
  .otherwise({
    redirectTo: '/'
  });

}]);
