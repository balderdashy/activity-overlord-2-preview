angular.module('activityApp').controller('navBarController', ['$rootScope', '$scope', '$location', function ($rootScope, $scope, $location) {

	// console.log('rootScope in navbar controller:', $rootScope);
	// console.log('scope in navbar controller:', $scope);

	// isAuthenticated as an argument above is just the boolean.

  // The getClass method works with the markup like this:
  //<li ng-class="{'active':getClass('/users')}"><a href="/#users">User Administration</a></li>
  // If the path is equal to /users than make the a tag active.

    $scope.getClass = function (path) {
        if ($location.path().substr(0, path.length) == path) {
            return true
        } else {
            return false;
        }
    }
}]);