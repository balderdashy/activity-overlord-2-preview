angular.module('activityApp').service('userService', function($http, $q){
	// this.getUsers = function() {
	// 	return users;
	// };


	this.getUsers = function() {
	
		var baseUrl = '';
        var userId = 1;

        // We needed to have a reference to what find() returned
        var deferredObj = find();
        
        function find () {
            var deferred = $q.defer();
            var url = baseUrl +  '/user';

            $http.get(url).success(deferred.resolve).error(deferred.reject);

            return deferred.promise;
        };

        // this is find
        return deferredObj;
    
	};    


	this.getUser = function(id) {
		for (var i=0; i < users.length; i++) {
			if (users[i].id === id) {
				return users[i];
			}
		}
		return null;
	};

	// var users = [
	// 	{
	// 		id: 1, name: 'John Galt', title: 'Genius', email: 'john@rand.com', authenticated: true
	// 	},
	// 	{	
	// 		id: 2, name: 'Dagny Taggart', title: 'President', email: 'dagny@taggarttranscontinental.com', authenticated: false
	// 	}, 
	// 	{
	// 		id: 3, name: 'Hank Rearden', title: 'President', email: 'hank@reardensteel.com', authenticated: false
	// 	}
	// ];
});