angular.module('ActivityOverlord')
.factory('uiErrorBus', [

/**
 * Module Dependencies
 */

        '$rootScope', '$timeout',
function($rootScope ,  $timeout ) {


  /**
   * uiErrorBus
   *
   * @class        {angular.factory}
   * @module       ActivityOverlord
   * @type         {Function}
   * @description  An app-global singleton (aka "angular service") that manages a
   *               collection of any serious errors (e.g. network connection failure)
   *               and related metadata. This is the "catch-all" error handling logic
   *               to use when nothing more customized/ui-specific exists (or makes sense).
   *               • Manipulates the DOM using a namespace within $rootScope.
   *               • Maintains certain parts of the global error state of the application
   *               using private variables-- e.g. rather than revealing the vars directly,
   *               it exposes getter methods that provide programmatic access to common
   *               questions other UI controls and factories might need to ask, such as
   *               "Is the UI currently locked because of a fatal global error?".
   *               • Exposes setter methods for manipulating its private error collection.
   */

  ////////////////////////////////////////////////////////////////////////////////
  // // usage:
  // uiErrorBus.handleError('hold on now pardner there\'s a snake in my boot!!');
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  function UIErrorBus() {}

  // Private error collection
  var _errors = [];

  // Error collection for DOM
  $rootScope.errorBus = [];

  /**
   * Inform uiErrorBus about a new fatal error that occurred.
   *
   * ----------------------------------------------------------------
   * someOtherFactoryOrSomething.someFn({ id: '8' })
   * .then(...)
   * .catch(uiErrorBus.handleError)
   * ----------------------------------------------------------------
   */
  UIErrorBus.prototype.handleError = function (e){

    // metaErr is stored in the $rootScope.
    var metaErr = {
      message: typeof e === 'object' ? e.message : e,
      raw: e
    };

    // By default, hide errors after 15 seconds.
    // (also  you can pass e.timeout === -1)
    if (typeof e !== 'object' || !e.timeout || e.timeout < 0) {
      e._uiErrorBusTimer = $timeout(function (){
        _errors.splice(_errors.indexOf(e),1);
        $rootScope.errorBus.splice($rootScope.errorBus.indexOf(metaErr),1);
      }, (typeof e === 'object' && e.timeout) || 15000);
    }

    _errors.push(e);
    $rootScope.errorBus.push(metaErr);



    if (typeof console === 'object' && typeof console.error === 'function' && typeof console.log === 'function') {
      console.log('* * * Oops! * * *\nAn error occurred:');
      console.log(e);
    }
  };


  return new UIErrorBus();

}]);
