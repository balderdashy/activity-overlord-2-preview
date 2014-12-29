angular.module('ActivityOverlord', ['ngRoute', 'toastr']);

angular.module('ActivityOverlord')
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
angular.module('ActivityOverlord')
.config(['$httpProvider', function($httpProvider){

  // Set the X-CSRF-Token header on every http request.
  // (this doesn't take care of sockets!  We do that elsewhere.)
  $httpProvider.defaults.headers.common['X-CSRF-Token'] = window.SAILS_LOCALS._csrf;
}]);

// A directive to compare passwords in a form by K. Scott Allen
// http://odetocode.com/blogs/scott/archive/2014/10/13/confirm-password-validation-in-angularjs.aspx

var compareTo = function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
             
            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };
 
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
};
 
angular.module('ActivityOverlord').directive("compareTo", compareTo);

// Listen for url fragment changes like "#/foo/bar-baz" so we can change the contents
// of the <ng-view> tag (if it exists)
angular.module('ActivityOverlord')
.config(['$routeProvider', function($routeProvider) {

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
    controller: ['$scope', '$location', '$http', function($scope, $location, $http) {
      if (!$scope.me.isAdmin) {
        $location.path('/');
        $location.replace();
        return;
      }

      // Send request to Sails to fetch list of users.
      $scope.userList.loading = true;
      $scope.userList.errorMsg = '';
      $http.get('/users')
      .then(function onSuccess(sailsResponse) {
        $scope.userList.contents = sailsResponse.data;
      })
      .catch(function onError(sailsResponse) {
        // Display generic error, since there are no expected errors.
        $scope.userList.errorMsg = 'An unexpected error occurred: '+(sailsResponse.data||sailsResponse.status);
      })
      .finally(function eitherWay(){
        $scope.userList.loading = false;
      });
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
