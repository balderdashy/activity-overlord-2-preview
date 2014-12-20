angular.module('activityApp').controller('userController', function($scope, userService, usersService, $routeParams) {
	
		init();

		function init() {

			userService.getUsers().then(function (result) {
				console.log(result);
				$scope.users = result;
			}, function (error) {
				console.log(error);
			});
			
			
			var userID = $routeParams.userID;
			console.log("params = ", $routeParams);

			usersService.find(userID).then(function (result) {
					console.log(result);
					$scope.user = result;
				}, function (reason) {
					console.log('ERROR', reason);
				});



			// $scope.getUser = function() {
			// 	usersService.find().then(function (result) {
			// 		console.log(result);
			// 	}, function (reason) {
			// 		console.log('ERROR', reason);
			// 	});
			// };

						

			// var baseURL = '/';
			// var userId = 1;

			// $scope.find = function () {
		 //        var deferred = $q.defer();
		 //        var url = baseURL +  'user/' + userId;

		 //        $http.get(url).success(deferred.resolve).error(deferred.reject);

		 //        console.log(deferred);

		 //        return deferred.promise;
		 //    };

		 //    $scope.find();
		}

});