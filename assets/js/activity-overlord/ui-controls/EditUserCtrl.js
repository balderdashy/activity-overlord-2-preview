angular.module('ActivityOverlord').controller('edit-userController', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {

  $scope.getUser = function() {
    var url = '/user/' + $routeParams.userID;

    console.log("getUser() called");

    $http.get(url).then(function(response) {
      $scope.user = response.data;
      console.log($scope.user);
    }, function(reason) {
      console.log('ERROR', reason);
    });
  };

  $scope.getUser();

  // $scope.editUser = function () {
  //     var url = '/user/' + $routeParams.userID;

  //     console.log("getUser() called");

  //     $http.get(url).then(function(response) {
  //       $scope.user = response.data;
  //       console.log($scope.user);
  //     }, function (reason) {
  //         console.log('ERROR', reason);
  //     });
  // };

  // $scope.editUser();


}]);
