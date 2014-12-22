angular.module('activityApp', ['ngRoute']);

angular.module('activityApp')
.config(['$routeProvider', 
	function ($routeProvider){
	$routeProvider

		.when('/',
			{
				templateUrl: 'views/home.html'
			})
		.when('/user',
			{
				controller: 'userController',
				templateUrl: 'views/users.html'
			})
		.when('/user/:userID',
			{
			  controller: 'profileController',
				templateUrl: 'views/profile.html'
			})
		.when('/edit-user/:userId',
		{
			controller: 'edit-userController',
			template: 'edit-user.html'
		})
		.otherwise({redirectTo: 'views/home.html'});
		
}]);