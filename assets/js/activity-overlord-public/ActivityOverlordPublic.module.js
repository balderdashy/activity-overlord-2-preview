/**
 * ActivityOverlordPublic
 *
 * An angular module for Activity Overlord's "frontoffice" pages (like `signup.ejs` or `homepage.ejs`)
 *
 * Usage:
 * ```
 * <div ng-app="ActivityOverlordPublic"></div>
 * ```
 */

angular.module('ActivityOverlordPublic', ['ngRoute', 'toastr', 'compareTo']);


angular.module('ActivityOverlordPublic')
.config(['toastrConfig', function (toastrConfig) {
  angular.extend(toastrConfig, {
    allowHtml: true,
    closeButton: false,
    closeHtml: '<button>&times;</button>',
    containerId: 'toast-container',
    extendedTimeOut: 1000,
    iconClasses: {
      error: 'toast-error',
      info: 'toast-info',
      success: 'toast-success',
      warning: 'toast-warning'
    },
    messageClass: 'toast-message',
    positionClass: 'toast-top-right',
    tapToDismiss: true,
    timeOut: 2000,
    titleClass: 'toast-title',
    toastClass: 'toast'
  });
}]);


// Set up all of our HTTP requests to use a special header
// which contains the CSRF token.
// More about CSRF here: http://sailsjs.org/#/documentation/concepts/Security/CSRF.html
angular.module('ActivityOverlordPublic')
.config(['$httpProvider', function($httpProvider){

  // Set the X-CSRF-Token header on every http request.
  // (this doesn't take care of sockets!  We do that elsewhere.)
  $httpProvider.defaults.headers.common['X-CSRF-Token'] = window.SAILS_LOCALS._csrf;
}]);


// If we were using an <ng-view>, wed want to bring in ngRoute as a dependency at the top of this file,
// and also include something like the following:
//
// Listen for url fragment changes like "#/foo/bar-baz" so we can change the contents
// of the <ng-view> tag (if it exists)
// angular.module('ActivityOverlordPublic')
// .config(['$routeProvider', function($routeProvider) {

//   $routeProvider

//   // #/    (i.e. ng-view's "home" state)
//   .when('/', {
//     templateUrl: 'templates/public/jumbotron.html',
//     controller: ['$scope', '$location', function($scope, $location) {
//       // ...
//     }]
//   })

//   // #/    (i.e. ng-view's "home" state)
//   .when('/signup', {
//     templateUrl: 'templates/public/signup.html',
//     controller: ['$scope', '$location', function($scope, $location) {
//       // ...
//     }]
//   })

//   .otherwise({
//     redirectTo: '/'
//   });
// }]);
