angular.module('ActivityOverlord').controller('AdminDashboardCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {

  $scope.getUsers = function() {
    var url = '/user';

    $http.get(url).then(function(response) {
      $scope.users = response.data;
      console.log("These are the users: ", $scope.users);
    }, function(reason) {
      console.log('ERROR', reason);
    });
  };

  $scope.getUsers();

}]);
