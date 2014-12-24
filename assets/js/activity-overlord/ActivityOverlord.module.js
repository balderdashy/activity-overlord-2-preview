angular.module('ActivityOverlord', ['ngRoute']);
angular.module('ActivityOverlord').config(['$routeProvider',function($routeProvider) {

    $routeProvider
    .when('/', {
      templateUrl: 'templates/home.html'
    })
    .when('/user', {
      controller: 'AdminDashboardCtrl',
      templateUrl: 'templates/users.html'
    })
    .when('/user/:userID', {
      controller: 'UserProfileCtrl',
      templateUrl: 'templates/profile.html'
    })
    .when('/edit-user/:userId', {
      controller: 'EditUserCtrl',
      template: 'edit-user.html'
    })
    .otherwise({
      redirectTo: 'templates/home.html'
    });

  }
]);
