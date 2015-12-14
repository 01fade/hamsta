var angular = angular || {};

angular.module('app.controller.connectremote', [])
.controller('ConnectRemoteCtrl', function($scope, $rootScope, $location, $socket, $state) {
	console.log("ConnectRemoteCtrl.");
    $rootScope.title = $location.url();

	$scope.keyToSend = function () {
		console.log($("#keyval").val());
		console.log("send key", $scope.matchKey);
	    $socket.emit('matchKey', $scope.matchKey, function (data) {
	        //this is the callback function
	        console.log(data);
	        if (data == "wrong") {
	        	alert("Ooops, something went wrong.\nPlease refresh both your screens (computer and this).")
	        	$location.url('/start');
	        }
	    });
	};

	$socket.on('matched', function (data) {
	    console.log("matched", data);
	    $rootScope.partner = data.partner;
	    $state.transitionTo('TurnOn');
	});

	// $socket.on('refresh', function($scope){
	// 	$location.url('/start');
	// });

});