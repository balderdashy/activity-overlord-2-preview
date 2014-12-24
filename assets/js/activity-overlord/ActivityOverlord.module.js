angular.module('ActivityOverlord', ['ngRoute']);
angular.module('ActivityOverlord').config(['$routeProvider', function($routeProvider) {

  $routeProvider

  // #/    (i.e. ng-view's "home" state)
  .when('/', {
    templateUrl: 'templates/admin-dashboard-home.html',
    // If the current user is an admin, "redirect" (client-side) to `#/users`.
    controller: ['$location', function($location) {
      if (window.BOOTSTRAPPED_DATA.me.isAdmin) {
        window.location.hash = '#/users';
        return;
      }
    }]
  })


  // #/users
  .when('/users', {
    // Don't allow non-admins to access #/users.
    controller: ['$location', function($location) {
      if (!window.BOOTSTRAPPED_DATA.me.isAdmin) {
        window.location.hash = '#/';
        return;
      }
    }],
    templateUrl: 'templates/admin-dashboard-users.html'
  })


  // #/users/:id
  .when('/users/:userID', {
    // controller: 'UserProfileCtrl',
    templateUrl: 'templates/admin-dashboard-profile.html'
  })

  // #/users/:id/edit
  .when('/users/:userId/edit', {
    // controller: 'EditUserCtrl',
    template: 'admin-dashboard-edit-user.html'
  })


  // #/?????     (i.e. anything else)
  .otherwise({
    redirectTo: '/'
  });

}]);
