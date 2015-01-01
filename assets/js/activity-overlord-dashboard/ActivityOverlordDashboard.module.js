angular.module('ActivityOverlordDashboard', ['ngRoute', 'toastr']);

angular.module('ActivityOverlordDashboard')
.config(function(toastrConfig) {
  angular.extend(toastrConfig, {
    allowHtml: true,
    closeButton: false,
    closeHtml: '<button>&times;</button>',
    containerId: 'toast-container',
    extendedTimeOut: 1000,
    iconClasses: {
      error: 'toast-error',
      info: 'toast-info',
      success: 'toast-success',
      warning: 'toast-warning'
    },
    messageClass: 'toast-message',
    positionClass: 'toast-top-right',
    tapToDismiss: true,
    timeOut: 2000,
    titleClass: 'toast-title',
    toastClass: 'toast'
  });
});


// Set up all of our HTTP requests to use a special header
// which contains the CSRF token.
// More about CSRF here: http://sailsjs.org/#/documentation/concepts/Security/CSRF.html
angular.module('ActivityOverlordDashboard')
.config(['$httpProvider', function($httpProvider){

  // Set the X-CSRF-Token header on every http request.
  // (this doesn't take care of sockets!  We do that elsewhere.)
  $httpProvider.defaults.headers.common['X-CSRF-Token'] = window.SAILS_LOCALS._csrf;
}]);

/**
 * Time ago filter.
 *
 */
angular.module('ActivityOverlordDashboard')

.filter('timeAgo', function() {

  var timeAgoFilter = function (date) {
    return moment(date).fromNow();
  };

  return timeAgoFilter;

})


// Listen for url fragment changes like "#/foo/bar-baz" so we can change the contents
// of the <ng-view> tag (if it exists)
angular.module('ActivityOverlordDashboard')
.config(['$routeProvider', function($routeProvider) {

  $routeProvider

  // #/    (i.e. ng-view's "home" state)
  .when('/', {
    template: '',
    // If the current user is an admin, "redirect" (client-side) to `#/users`.
    // Otherwise redirect to `#/profile`
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

      // Client-side redirect to `#/profile`
      $location.path('/profile');
      $location.replace();
      return;
    }]
  })


  // #/users
  .when('/users', {
    templateUrl: 'templates/dashboard/users.html',
    // Don't allow non-admins to access #/users.
    controller: ['$scope', '$location', '$http', function($scope, $location, $http) {
      if (!$scope.me.isAdmin) {
        $location.path('/');
        $location.replace();
        return;
      }

      // Send request to Sails to fetch list of users.
      // (Note that this endpoint also subscribes us to each of those user records,
      //  and watches the User model)
      $scope.userList.loading = true;
      $scope.userList.errorMsg = '';
      io.socket.get('/users', function (data, jwr) {
        if (jwr.error) {
          // Display generic error, since there are no expected errors.
          $scope.userList.errorMsg = 'An unexpected error occurred: '+(data||jwr.status);

          // Hide loading spinner
          $scope.userList.loading = false;
          return;
        }
        // Populate the userList with the newly fetched users.
        $scope.userList.contents = data;

        // Initially set `isActive` on the user referred to by `$scope.me`
        // because if you're loading this page, your user must be active.
        var currentUser = _.find($scope.userList.contents, {id: $scope.me.id});
        currentUser.isActive = true;

        // Also initially set `msUntilInactive` to whatever the server told us
        // on any user marked as `isActive` by the server.
        var activeUsers = _.each($scope.userList.contents, function (user){
          if (user.msUntilInactive > 0){
            user.isActive = true;
          }
        });

        // Hide loading spinner
        $scope.userList.loading = false;

        // Because `io.socket.on` isn't `io.socket.$on` or something
        // we have to do this to render our changes into the DOM.
        $scope.$apply();
      });
    }]
  })


  // #/users/:id
  .when('/users/:id', {
    templateUrl: 'templates/dashboard/show-user.html',
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
      io.socket.get('/users/'+$routeParams.id, function onResponse(data, jwr){
        if (jwr.error) {
          $scope.userProfile.errorMsg = data||jwr.status;
          $scope.userProfile.loading = false;
          return;
        }
        angular.extend($scope.userProfile.properties, data);
        $scope.userProfile.loading = false;
        $scope.$apply();
      });

    }]
  })

  // #/users/:id/edit
  .when('/users/:id/edit', {
    templateUrl: 'templates/dashboard/edit-user.html',
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
    templateUrl: 'templates/dashboard/my-profile.html',
    controller: ['$scope', '$location', '$http', function($scope, $location, $http) {

      // We already have this data in $scope.me, so we don't need to show a loading state.
      $scope.userProfile.loading = false;

      // We only talk to the server here in order to subscribe to ourselves
      io.socket.get('/users/'+$scope.me.id, function onResponse(data, jwr){
        if (jwr.error){
          console.error('Unexpected error from Sails:', jwr.error);
          return;
        }
        // angular.extend($scope.userProfile.properties, res.data);
      });

      // Pass `$scope.me` in to `$scope.userProfile`
      angular.extend($scope.userProfile.properties, $scope.me);

    }]
  })



  // #/stuff
  .when('/stuff', {
    templateUrl: 'templates/dashboard/example-page.html'
  })



  // #/?????     (i.e. anything else)
  .otherwise({
    redirectTo: '/'
  });

}]);
