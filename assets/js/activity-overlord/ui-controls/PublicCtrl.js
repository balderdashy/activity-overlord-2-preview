angular.module('ActivityOverlord').controller('PublicCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {

  /////////////////////////////////////////////////////////////////////////////////
  // When HTML is rendered...
  /////////////////////////////////////////////////////////////////////////////////

  // Set up initial state
  $scope.signupForm = {
    loading: false,
    topLevelErrorMessage: null,
    validationErrors: []
  };




  /////////////////////////////////////////////////////////////////////////////////
  // DOM events:
  /////////////////////////////////////////////////////////////////////////////////

  $scope.submitSignupForm = function (){

    // Check that passwords match
    if ($scope.signupForm.password !== $scope.signupForm.confirmPassword) {
      // TODO: improve and finish client-side validation, probably using ng-form.
      $scope.signupForm.topLevelErrorMessage = 'Please make sure the passwords match.';
      return;
    }

    // Set the loading state (i.e. show loading spinner)
    $scope.signupForm.loading = true;

    // Wipe out errors since we are now loading from the server again and we aren't sure if
    // the current form values that were entered are valid or not.
    $scope.signupForm.validationErrors = [];
    $scope.signupForm.topLevelErrorMessage = null;

    // Submit request to Sails.
    $http.post('/signup', {
      name: $scope.signupForm.name,
      title: $scope.signupForm.title,
      email: $scope.signupForm.email,
      password: $scope.signupForm.password
    })
    .then(function (){
      // Refresh the page now that we've been logged in.
      window.location = '/';
    })
    .catch(function (res) {

      console.log('\n\nERROR RESP!',res);

      // Handle known error type.
      var emailAddressAlreadyInUse = !res.data && res.data.error !== 'E_VALIDATION';
      if (emailAddressAlreadyInUse) {
        // TODO
        return;
      }

      // Otherwise, display generic error if the error is unrecognized.
      $scope.signupForm.topLevelErrorMessage = 'An unexpected error occurred: '+(res.data||res.status);

    })
    .finally(function (){
      $scope.signupForm.loading = false;
    });
  };

}]);
