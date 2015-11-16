var angular = angular || {};

angular.module('app.controller.start', [])
.controller('StartCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
	console.log("StartCtrl.");

	//http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
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
		$state.transitionTo('ConnectRemote'); 
	} else {
		$state.transitionTo('ConnectScreen');
	}
}]);


