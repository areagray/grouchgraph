
angular.module('grouchgraph', [])


.controller('grouchController', function ($scope, $http) {
  $scope.response = 'reponse here hey';
  $scope.data = {};
  $scope.greeting = function(){
  	alert('hello');
  };
  $scope.getPosts = function(){
  	console.log('getPosts triggered');

	  $http({method: 'GET', url: '/posts'}).
	    success(function(data, status, headers, config) {
	    	console.log('the data is', data);
	    	$scope.data = data;

	    }).
	    error(function(data, status, headers, config) {
			console.log('error form api');
	    });

  }

});