var angular = angular || {};

angular.module('app.controller.turnon', [])
.controller('TurnOnCtrl', function($scope, $rootScope, $location, $socket, $state, $interval) {
	console.log("TurnOnCtrl.");
    $rootScope.title = $location.url();

    var promise 
    function fadeCheck () {
 		console.log("here");
	    if($rootScope.partner == undefined) {$location.url('/start');};
		$("#turnon").fadeTo( 2000 , 0.4, function(){
			$("#turnon").fadeTo( 2000 , 1);
		});   	
    };

    promise = $interval(fadeCheck, 4000);

	if($rootScope.partner == undefined) {$location.url('/start');};
	console.log("Partner: " + $rootScope.partner);

	var isMobile = {
	    Android: function() {
	        return navigator.userAgent.match(/Android/i);
	    },
	    BlackBerry: function() {
	        return navigator.userAgent.match(/BlackBerry/i);
	    },
	    iOS: function() {
	        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	    },
	    Opera: function() {
	        return navigator.userAgent.match(/Opera Mini/i);
	    },
	    Windows: function() {
	        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
	    },
	    any: function() {
	        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	    }
	};

	if ( isMobile.any() || window.innerWidth < 600) {
		$("#mobile").show();
	} else {
		$("#desktop").show();
	}

	$scope.turnon = function () {
		$socket.emit ('remote turn on', $rootScope.partner, function(data){
			if (data === "go to RemoteControl") {
				$state.transitionTo('RemoteControl');
			}
		});
	};

	$socket.on('turn on', function(){
		$state.transitionTo('TV');
	});

	$socket.on('refresh', function($scope){
		$location.url('/start');
	});

    $scope.$on('$destroy', function() {
      $interval.cancel(promise);
    });

});