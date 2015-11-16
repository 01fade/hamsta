var angular = angular || {};

angular.module('app.controller.cart', [])
.controller('CartCtrl', function($scope, $rootScope, $location, $socket, $state, $window) {
	console.log("CartCtrl.");
    $rootScope.title = $location.url();

});