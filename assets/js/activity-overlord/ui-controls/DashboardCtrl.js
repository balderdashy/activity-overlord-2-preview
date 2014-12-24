angular.module('ActivityOverlord').controller('DashboardCtrl', ['$scope', '$http', function($scope, $http) {
SCOPE=$scope;

  /////////////////////////////////////////////////////////////////////////////////
  // When HTML is rendered... (i.e. when the page loads)
  /////////////////////////////////////////////////////////////////////////////////

  // Set up initial objects
  // (kind of like our schema for the page)
  $scope.userProfile = {
    properties: {},
    errorMsg: '',
    saving: false,
    loading: false
  };

  $scope.userList = {
    loading: false,
    errorMsg: '',
    contents: []
  };

  $scope.changePasswordForm = {
    saving: false,
    errorMsg: '',
    properties: {}
  };

  // Pull representation of the current visitor from data bootstrapped into the
  // EJS view from ther server (i.e. `SAILS_LOCALS`)
  $scope.me = window.SAILS_LOCALS.me;


  // "Watch" the user model and "subscribe" to each user record.
  io.socket.get('/users/watch', function (unused, jwr) {
    if (jwr.error){
      console.error('Error subscribing to user events:', jwr.error);
      return;
    }

    // OK! Now we're subscribed to all of the user records in the database.
  });

  // Let Sails know we've come online.
  io.socket.put('/me/online', function (unused,jwr){
    if (jwr.error){
      console.error('Error announcing new socket connection to Sails:',jwr);
      return;
    }
  });




  /////////////////////////////////////////////////////////////////////////////////
  // Socket (server-sent) events:
  /////////////////////////////////////////////////////////////////////////////////

  // When a "user" event is emitted from the server
  // (i.e. a controller or blueprint action calls `User.publishUpdate()`,
  //  `User.publishCreate`, etc.)
  io.socket.on('user', function (event){
    console.log(event);

    if (event.verb === 'updated') {
      var foundUser = _.find($scope.userList.contents, {id: event.id});
      if (foundUser) {
        _.extend(foundUser, event.data);
      }

      // Because `io.socket.on` isn't `io.socket.$on` or something
      // we have to do this to render our changes into the DOM.
      $scope.$apply();
      return;
    }

    if (event.verb === 'created') {
      $scope.userList.contents.push(event.data);

      // Because `io.socket.on` isn't `io.socket.$on` or something
      // we have to do this to render our changes into the DOM.
      $scope.$apply();
      return;
    }

    if (event.verb === 'destroyed') {
      return;
    }

    throw new Error('Unexpected/unknown socket event: "'+event.verb+'" received from Sails.');
  });



  /////////////////////////////////////////////////////////////////////////////////
  // DOM events:
  /////////////////////////////////////////////////////////////////////////////////


  $scope.editMyProfile = function (){

    // Set loading ("saving") state
    $scope.userProfile.saving = true;
    $scope.userProfile.errorMsg = '';

    // Send request to Sails to delete the specified user.
    return $http.put('/me', {
      name: $scope.userProfile.properties.name,
      title: $scope.userProfile.properties.title,
      email: $scope.userProfile.properties.email,
      admin: $scope.userProfile.properties.admin
    })
    .then(function onSuccess(sailsResponse){
      // Everything is OK.
    })
    .catch(function onError(sailsResponse){

      // Handle known error type(s).
      var emailAddressAlreadyInUse = !sailsResponse.data && sailsResponse.data.error !== 'E_VALIDATION';
      if (emailAddressAlreadyInUse) {
        $scope.userProfile.errorMsg = 'Email address already in use.';
        return;
      }

      // Otherwise, display generic error if the error is unrecognized.
      $scope.userProfile.errorMsg = 'An unexpected error occurred: '+(sailsResponse.data||sailsResponse.status);
    })
    .finally(function eitherWay(){
      $scope.userProfile.saving = false;
    });
  };


  $scope.changeMyPassword = function (){
    // TODO: verify that passwords match (client-side)

    // Set loading ("saving") state
    $scope.changePasswordForm.saving = true;
    $scope.changePasswordForm.errorMsg = '';

    // Send request to Sails to delete the specified user.
    return $http.put('/me', {
      password: $scope.changePasswordForm.properties.password
    })
    .then(function onSuccess(sailsResponse){
      // Everything is OK.
    })
    .catch(function onError(sailsResponse){
      $scope.changePasswordForm.errorMsg = 'An unexpected error occurred: '+(sailsResponse.data||sailsResponse.status);
    })
    .finally(function eitherWay(){
      $scope.changePasswordForm.saving = false;
    });
  };



  /**
   * Our user signaled her intent to edit a user.
   */
  $scope.editUser = function (userId){

    // Set loading ("saving") state
    $scope.userProfile.saving = true;
    $scope.userProfile.errorMsg = '';

    // Send request to Sails to delete the specified user.
    return $http.put('/users/'+userId, {
      name: $scope.userProfile.properties.name,
      title: $scope.userProfile.properties.title,
      email: $scope.userProfile.properties.email,
      admin: $scope.userProfile.properties.admin
    })
    .then(function onSuccess(sailsResponse){
      // Everything is OK.
    })
    .catch(function onError(sailsResponse){

      // Handle known error type(s).
      var emailAddressAlreadyInUse = !sailsResponse.data && sailsResponse.data.error !== 'E_VALIDATION';
      if (emailAddressAlreadyInUse) {
        $scope.userProfile.errorMsg = 'Email address already in use.';
        return;
      }

      // Otherwise, display generic error if the error is unrecognized.
      $scope.userProfile.errorMsg = 'An unexpected error occurred: '+(sailsResponse.data||sailsResponse.status);
    })
    .finally(function eitherWay(){
      $scope.userProfile.saving = false;
    });
  };


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
      // Handle known error type(s):

      // tODO: toast messages (maybe uiErrorBus?)

      // // • User no longer exists.
      // if (sailsResponse.status === 404) {
      //   $otherUser.errorMsg = 'Cannot delete user-- does not exist.';
      //   return;
      // }

      // // • Otherwise display generic error.
      // $otherUser.errorMsg = 'An unexpected error occurred: '+(sailsResponse.data||sailsResponse.status);
    })
    .finally(function eitherWay(){
      // Disable loading state (if still relevant)
      if (!$otherUser) return;
      $otherUser.deleting = false;
    });
  };

}]);
