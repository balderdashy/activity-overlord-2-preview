angular.module('ActivityOverlord', ['ngRoute']);
angular.module('ActivityOverlord').config(['$routeProvider',function($routeProvider) {

    $routeProvider

    // #/
    .when('/', {
      templateUrl: 'templates/home.html',
      // If the current user is an admin, "redirect" (client-side) to `#/users`.
      controller: ['$location', function ($location){
        if (window.BOOTSTRAPPED_DATA.me.isAdmin) {
          window.location.hash = '#/users';
          return;
        }
      }]
    })


    // #/users
    .when('/users', {
      // Don't allow non-admins to access #/users.
      controller: ['$location', function ($location){
        if (!window.BOOTSTRAPPED_DATA.me.isAdmin) {
          window.location.hash = '#/';
          return;
        }
      }],
      templateUrl: 'templates/users.html'
    })


    .when('/user/:userID', {
      // controller: 'UserProfileCtrl',
      templateUrl: 'templates/profile.html'
    })
    .when('/edit-user/:userId', {
      // controller: 'EditUserCtrl',
      template: 'edit-user.html'
    })
    .otherwise({
      redirectTo: '/'
    });

  }
]);
