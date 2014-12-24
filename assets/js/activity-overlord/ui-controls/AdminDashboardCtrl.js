angular.module('ActivityOverlord').controller('AdminDashboardCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {


  /////////////////////////////////////////////////////////////////////////////////
  // When HTML is rendered...
  /////////////////////////////////////////////////////////////////////////////////

  $scope.userList = {
    loading: false,
    errorMsg: '',
    contents: []
  };


  // Fetch list of users from the server.
  $scope.userList.loading = true;
  $scope.userList.errorMsg = '';
  $http.get('/users').then(function(res) {
    $scope.userList.contents = res.data;
  })
  .catch(function(res) {
    // Display generic error, since there are no expected errors.
    $scope.userList.errorMsg = 'An unexpected error occurred: '+(res.data||res.status);
  })
  .finally(function (){
    $scope.userList.loading = false;
  });




  /////////////////////////////////////////////////////////////////////////////////
  // DOM events:
  /////////////////////////////////////////////////////////////////////////////////

  // ...

}]);
