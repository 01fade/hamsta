var angular = angular || {};

angular.module('app.controller.buy', [])
.controller('BuyCtrl', function($scope, $rootScope, $location, $socket, $state) {
	console.log("BuyCtrl.");
    $rootScope.title = $location.url();
    
});