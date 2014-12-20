angular.module('activityApp').controller('userController',
  ['$scope', '$http', '$location', function($scope, $http, $location){

	$scope.getUsers = function () {
    var url = '/user';

    $http.get(url).then(function(response) {
        $scope.users = response.data; 
        console.log($scope.users);
      }, function (reason) {
          console.log('ERROR', reason);
      });
  };    

  $scope.getUsers();

}]);