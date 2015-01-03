angular.module('ActivityOverlordPublic').controller('PublicCtrl', ['$scope', '$http', '$location', 'toastr', function($scope, $http, $location, toastr) {

  /////////////////////////////////////////////////////////////////////////////////
  // When HTML is rendered...
  /////////////////////////////////////////////////////////////////////////////////

  // Set up initial state
  $scope.signupForm = {
    loading: false,
    topLevelErrorMessage: '',
    validationErrors: []
  };

  $scope.loginForm = {
    loading: false,
    topLevelErrorMessage: ''
  };




  /////////////////////////////////////////////////////////////////////////////////
  // DOM events:
  /////////////////////////////////////////////////////////////////////////////////


  $scope.submitLoginForm = function (){

    // Set the loading state (i.e. show loading spinner)
    $scope.loginForm.loading = true;

    // Wipe out errors since we are now loading from the server again and we aren't sure if
    // the current form values that were entered are valid or not.
    $scope.loginForm.topLevelErrorMessage = null;

    // Submit request to Sails.
    $http.put('/login', {
      email: $scope.loginForm.email,
      password: $scope.loginForm.password
    })
    .then(function onSuccess (){
      // Refresh the page now that we've been logged in.
      window.location = '/';
    })
    .catch(function onError(sailsResponse) {

      // Handle known error type(s).
      //
      console.log(sailsResponse);

      // Invalid username / password combination.
      if (sailsResponse.status === 400 || 404) {
        // $scope.loginForm.topLevelErrorMessage = 'Invalid email/password combination.';
        //
        toastr.error('Invalid email/password combination.', 'Error', {
          closeButton: true
        });
        return;
      }

      // Otherwise, display generic error if the error is unrecognized.
      // $scope.loginForm.topLevelErrorMessage = 'An unexpected error occurred: '+(sailsResponse.data||sailsResponse.status);

    })
    .finally(function eitherWay(){
      $scope.loginForm.loading = false;
    });
  };



  $scope.submitSignupForm = function (){

    // // Check that passwords match
    // if ($scope.signupForm.password !== $scope.signupForm.confirmPassword) {
    //   // TODO: improve and finish client-side validation, probably using ng-form.
    //   $scope.signupForm.topLevelErrorMessage = 'Please make sure the passwords match.';
    //   return;
    // }

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
    .then(function onSuccess (){
      // Refresh the page now that we've been logged in.
      window.location = '/';
    })
    .catch(function onError(sailsResponse) {

      console.log(sailsResponse);

      // Handle known error type(s).
      // var emailAddressAlreadyInUse = !sailsResponse.data && sailsResponse.data.error !== 'E_VALIDATION';
      var emailAddressAlreadyInUse = sailsResponse.status == 409;
      if (emailAddressAlreadyInUse) {
        toastr.error('That email address has already been taken, please try again.', 'Error');
        // $scope.signupForm.topLevelErrorMessage = 'Email address already in use.';
        return;
      }

      if (sailsResponse.data.raw.code === 11000) {
        toastr.error('That email address has already been taken, please try again.', 'Error');
      }

      // Otherwise, display generic error if the error is unrecognized.
      // $scope.signupForm.topLevelErrorMessage = 'An unexpected error occurred: '+(sailsResponse.data||sailsResponse.status);

      // toastr.error('That email address has already been taken, please try again.', 'Error');
        // console.log("made it here");
    })
    .finally(function eitherWay(){
      $scope.signupForm.loading = false;
    });
  };

}]);
