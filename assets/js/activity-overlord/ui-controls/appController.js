angular.module('ActivityOverlord').controller('appController',
  ['$scope','$q', '$http', '$location', function($scope, $q, $http, $location){

	// Grabs bootstrapped data from angular-layout.ejs
  $scope.isAuth = BOOTSTRAPPED_DATA.isAuth;
  $scope.userName = BOOTSTRAPPED_DATA.name;
  $scope.userId = BOOTSTRAPPED_DATA.id;

  // console.log("made it here");

  // Logs user out in terms of the back-end by calling /session/destroy which is routed to the session destroy
  // action on the back-end.
  $scope.signOutUser = function() {

    // This is the equivalent of a GET request to the path /session/destroy
    window.location.href = "/auth/destroy";

  }

  // var baseUrl = '';
  // var userId = $routeParams.userID;

  $scope.getUserList = function () {

    $location.url('/user');
  }

  // Get a profile
  $scope.getProfile = function() {

    $location.url('/user/' + $scope.userId);

  }

  // Edit a profile
  $scope.editUser = function() {

    $location.url('/edit-user/' + $scope.userId);

  }

  // $scope.getUser = function () {
  //     var url = '/user/' + $scope.userId;

  //     console.log("getUser() called");

  //     $http.get(url).then(function(response) {
  //       $scope.user = response.data;
  //       console.log($scope.user);
  //     }, function (reason) {
  //         console.log('ERROR', reason);
  //     });

  //     $location.url('/user/' + $scope.userId);
  // };

  // $scope.getUser();

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
