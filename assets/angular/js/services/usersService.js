angular.module('activityApp')
    .factory('usersService', function ($http, $q) {
        var baseUrl = '';
        var userId = 1;
        
        
        var find = function (id) {
            var deferred = $q.defer();
            var url = baseUrl +  '/user/' + userId;

            $http.get(url).success(deferred.resolve).error(deferred.reject);

            return deferred.promise;
        };

        // var find = function () {
        //     var deferred = $q.defer();
        //     var url = baseUrl +  '/user/' + userId;

        //     $http.get(url).success(deferred.resolve).error(deferred.reject);

        //     return deferred.promise;
        // };

        return {
            find: find
        }
    });