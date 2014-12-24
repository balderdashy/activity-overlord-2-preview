angular.module('ActivityOverlord', ['ngRoute']);
angular.module('ActivityOverlord').config(['$routeProvider', function($routeProvider) {

  $routeProvider

  // #/    (i.e. ng-view's "home" state)
  .when('/', {
    templateUrl: 'templates/dashboard-home.html',
    // If the current user is an admin, "redirect" (client-side) to `#/users`.
    controller: ['$scope', '$location', function($scope, $location) {
      if ($scope.me.isAdmin) {

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
    templateUrl: 'templates/dashboard-users.html',
    // Don't allow non-admins to access #/users.
    controller: ['$scope', '$location', function($scope, $location) {
      if (!$scope.me.isAdmin) {
        $location.path('/');
        $location.replace();
        return;
      }
    }]
  })


  // #/users/:id
  .when('/users/:id', {
    templateUrl: 'templates/dashboard-show-user.html',
    controller: ['$scope', '$location', '$routeParams', '$http', function($scope, $location, $routeParams, $http) {
      // Don't allow non-admins to access #/users/:id.
      if (!$scope.me.isAdmin) {
        $location.path('/');
        $location.replace();
        return;
      }


      // Lookup user with the specified id from the server
      $scope.userProfile.loading = false;
      $scope.userProfile.errorMsg = '';
      $http.get('/users/'+$routeParams.id)
      .then(function onSuccess(res){
        angular.extend($scope.userProfile.properties,res.data);
      })
      .catch(function onError(res){
        $scope.userProfile.errorMsg = res.data||res.status;
      })
      .finally(function eitherWay(){
        $scope.userProfile.loading = false;
      });

    }]
  })

  // #/users/:id/edit
  .when('/users/:id/edit', {
    templateUrl: 'templates/dashboard-edit-user.html',
    controller: ['$scope', '$location', '$routeParams', '$http', function($scope, $location, $routeParams, $http) {
      // Don't allow non-admins to access #/users/:id/edit.
      if (!$scope.me.isAdmin) {
        $location.path('/');
        $location.replace();
        return;
      }


      // Lookup user with the specified id from the server
      $scope.userProfile.loading = false;
      $scope.userProfile.errorMsg = '';
      $http.get('/users/'+$routeParams.id)
      .then(function onSuccess(res){
        angular.extend($scope.userProfile.properties, res.data);

        // THIS WEIRDNESS IS HERE AS A HACK TO FIX AN ISSUE w/ SAILS-DISK!
        // (save reference to original email)
        $scope.userProfile.properties._origEmail = $scope.userProfile.properties.email;
      })
      .catch(function onError(res){
        $scope.userProfile.errorMsg = res.data||res.status;
      })
      .finally(function eitherWay(){
        $scope.userProfile.loading = false;
      });
    }]
  })


  // #/profile
  .when('/profile', {
    templateUrl: 'templates/dashboard-my-profile.html',
    controller: ['$scope', '$location', '$http', function($scope, $location, $http) {

      // Pass `$scope.me` in to `$scope.userProfile`
      angular.extend($scope.userProfile.properties, $scope.me);

      // THIS WEIRDNESS IS HERE AS A HACK TO FIX AN ISSUE w/ SAILS-DISK!
      // (save reference to original email)
      $scope.userProfile.properties._origEmail = $scope.me.email;

    }]
  })



  // #/stuff
  .when('/stuff', {
    templateUrl: 'templates/dashboard-example-page.html'
  })



  // #/?????     (i.e. anything else)
  .otherwise({
    redirectTo: '/'
  });

}]);
