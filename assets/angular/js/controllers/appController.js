angular.module('activityApp').controller('appController',
  ['$scope','$q', '$http', '$routeParams', function($scope, $q, $http, $routeParams){

	// Grabs bootstrapped data from angular-layout.ejs  	
  $scope.isAuth = BOOTSTRAPPED_DATA.isAuth;
  $scope.userName = BOOTSTRAPPED_DATA.name;

  // Logs user out in terms of the back-end by calling /session/destroy which is routed to the session destroy 
  // action on the back-end.
  $scope.signOutUser = function() {

    // This is the equivalent of a GET request to the path /session/destroy
    window.location.href = "/session/destroy";

  }

 //  // This is the findUser function
	// var baseUrl = '';
 //  // var userID = $routeParams.userID;
 //  var userID = 1;
     
 //  $scope.find = function (id) {
 //    var deferred = $q.defer();
 //    var url = baseUrl +  '/user/' + userId;

 //    $http.get(url).success(deferred.resolve).error(deferred.reject);

 //    return deferred.promise;
 //  };

}]);