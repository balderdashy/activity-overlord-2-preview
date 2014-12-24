angular.module('ActivityOverlord').controller('DashboardCtrl', ['$scope', '$http', function($scope, $http) {


  /////////////////////////////////////////////////////////////////////////////////
  // When HTML is rendered...
  /////////////////////////////////////////////////////////////////////////////////

  $scope.userList = {
    loading: false,
    errorMsg: '',
    contents: []
  };


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




  /////////////////////////////////////////////////////////////////////////////////
  // DOM events:
  /////////////////////////////////////////////////////////////////////////////////


  /**
   * Our user signaled her intent to delete another user.
   */
  $scope.deleteUser = function (otherUserId){

    // Get a reference to the user row on the $scope so we can set
    // loading ("deleting") state.
    var $otherUser = _.find($scope.userList.contents, { id: otherUserId });

    // Set loading ("deleting") state
    $otherUser.deleting = true;

    // Send request to Sails to delete the specified user.
    $http.delete('/users/'+otherUserId)
    .then(function onSuccess(sailsResponse){
      // User deleted successfully from server- now we'll remove it
      // from `$scope.userList.contents` to clear it from the DOM.
      _.remove($scope.userList.contents, {
        id: otherUserId
      });
    })
    .catch(function onError(sailsResponse){

      // Disable loading state
      $otherUser.deleting = false;

      // Handle known error type(s):

      // tODO: toast messages (maybe uiErrorBus?)

      // // • User no longer exists.
      // if (sailsResponse.status === 404) {
      //   $otherUser.errorMsg = 'Cannot delete user-- does not exist.';
      //   return;
      // }

      // // • Otherwise display generic error.
      // $otherUser.errorMsg = 'An unexpected error occurred: '+(sailsResponse.data||sailsResponse.status);
    });
  };

}]);
