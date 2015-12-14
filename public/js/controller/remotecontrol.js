var angular = angular || {};

angular.module('app.controller.remotecontrol', [])
.controller('RemoteControlCtrl', ["$scope", "$rootScope", "$location", "$socket", "$state", "ParseService", "$interval",
	function($scope, $rootScope, $location, $socket, $state, ParseService, $interval) {
	console.log("RemoteControlCtrl.");
    $rootScope.title = $location.url();

	//comment out for testing
    if($rootScope.partner == undefined) {$state.transitionTo('Start');};

	var startMoment = new Date;
	var promiseHearts;
    var tempHearts = [];
    $scope.content = [];
    $scope.empty = true;
   	var index = 0;
	$scope.activechannel = 1;

     $scope.gettotal = function () {
		$scope.total = 0;
	    for (var i = $scope.content.length - 1; i >= 0; i--) {
	    	if ( $scope.content[i].price == " (Signup)") {
	    		$scope.total = $scope.total;
	    	} else {
			    $scope.total = $scope.total + $scope.content[i].price;
	    	}
		    console.log($scope.content[i].price);
	    };
	    // console.log($scope.total)
	    return $scope.total;
	};

    $socket.on('activechannel', function (data) {
    	$scope.activechannel = data.activechannel;
    	//overwrite the startMoment when you have a new channel
    	startMoment = new Date();
    });

 	$socket.on('refresh', function($scope){
		$location.url('/start');
	});

 	$socket.on('cart content', function (data){
 		console.log(data.content);
 		$scope.content = data.content;
 		if ($scope.content.length == 0){
 			$scope.empty = true;
 		} else {
 			$scope.empty = false;
	 		$scope.gettotal();
 		}
	});


 	////////////////////////////////// NAVIGATION /////////////////////////////////////
	$scope.turnoff = function(){
        $socket.emit('remote turn off', { "partner": $rootScope.partner }, function(data){
        	console.log(data);
        	if (data == true ) {
        		$state.transitionTo('TurnOn');
        	}
        });
	};

	$scope.tv = function(){
		$scope.morelinks = false;
        $socket.emit('remote close cart', { "partner": $rootScope.partner });
		$("#toucharea").show();
		$("#cartcontents").hide();
		$("#help").hide();
 		$("#viewcarticon").css("background-color", "#ccc");

		$("#tvicon").removeClass("inactive");
		$("#helpicon").addClass("inactive");
		$("#moreicon").addClass("inactive");
	};

	$scope.viewcart = function(){
		$scope.morelinks = false;
        $socket.emit('remote view cart', { "partner": $rootScope.partner });
		$("#toucharea").hide();
 		$("#cartcontents").show();
 		$("#viewcarticon").css("background-color", "#000");

		$("#tvicon").addClass("inactive");
		$("#helpicon").addClass("inactive");
		$("#moreicon").addClass("inactive");
	};

	$scope.next = function () {
		console.log(index);
		if(index == 0) {index++; $("#next").fadeIn(); $("#intro").fadeOut(); }
		else if(index == 1) {index++; $("#prev").fadeIn(); $("#next").fadeOut(); }
		else if(index == 2) {index++; $("#up").fadeIn(); $("#prev").fadeOut(); }
		else if(index == 3) {index++; $("#down").fadeIn(); $("#up").fadeOut(); }
		else if(index == 4) {index++; $("#heart").fadeIn(); $("#down").fadeOut(); }
		else if(index == 5) {index++; $("#end").fadeIn(); $("#heart").fadeOut(); }
		// else if(index == 5) {index = 0; $("#next").fadeIn(); $("#end").fadeOut(); };
	};

	$scope.prev = function () {
		console.log(index);
		if(index == 0) {
			// index = 0; $("#end").fadeIn(); $("#next").fadeOut();
		}
		else if(index == 1) {index--; $("#intro").fadeIn(); $("#next").fadeOut(); }
		else if(index == 2) {index--; $("#next").fadeIn(); $("#prev").fadeOut(); }
		else if(index == 3) {index--; $("#prev").fadeIn(); $("#up").fadeOut(); }
		else if(index == 4) {index--; $("#up").fadeIn(); $("#down").fadeOut(); }
		else if(index == 5) {index--; $("#down").fadeIn(); $("#heart").fadeOut(); }
		else if(index == 6) {index--; $("#heart").fadeIn(); $("#end").fadeOut();};
	};

	$scope.help = function(){
		$scope.morelinks = false;
        $socket.emit('remote close cart', { "partner": $rootScope.partner });
		$("#help").show();
		$("#toucharea").hide();
		$("#cartcontents").hide();
 		$("#viewcarticon").css("background-color", "#ccc");
		$("#tvicon").addClass("inactive");
		$("#helpicon").removeClass("inactive");
		$("#moreicon").addClass("inactive");

		//make sure
		$("#intro").show();
		$("#end").hide();
		index = 0;
	};

	$scope.more = function () {
		$scope.morelinks = true;
        $socket.emit('remote close cart', { "partner": $rootScope.partner });
		$("#toucharea").hide();
		$("#cartcontents").hide();
		$("#help").hide();
 		$("#viewcarticon").css("background-color", "#ccc");

		$("#tvicon").addClass("inactive");
		$("#helpicon").addClass("inactive");
		$("#moreicon").removeClass("inactive");
	};

 	////////////////////////////////// SWIPE /////////////////////////////////////


	//mn-touch swiping directive https://github.com/ilmente/mnTouch
	$scope.minus = function(){
        $socket.emit('remote plus', { "partner": $rootScope.partner });
        console.log("minus");
	};

	$scope.plus = function(){
        $socket.emit('remote minus', { "partner": $rootScope.partner });
         console.log("plus");
   };

	$scope.up = function(){
        $socket.emit('remote volume up', { "partner": $rootScope.partner });
        console.log("up");
	};

	$scope.down = function(){
        $socket.emit('remote volume down', { "partner": $rootScope.partner });
         console.log("down");
   };

	////////////////////////////////// TAP /////////////////////////////////////

	$scope.heart = function($event){
		console.log("heart");
        $socket.emit('heart plus', { "partner": $rootScope.partner });

        $("#toucharea").addClass("red");
        setTimeout(function(){$("#toucharea").removeClass("red")}, 1000);
        $("#carticon").addClass("lighter");
        setTimeout(function(){$("#carticon").removeClass("lighter")}, 1000);

        var thisMoment = new Date();
        var timePassed = Math.ceil((thisMoment - startMoment)/1000);
        tempHearts.push(timePassed);
	};

    function sendToParse () {
	    // channel, array of times for hearts
	    //for testing $scope.activechannel is 1
		ParseService.updateHearts($scope.activechannel, tempHearts, function(object) {
			// console.log(object);
		});
		// console.log(tempHearts);
    	tempHearts = [];
	};

	//from the beginning
	promiseHearts = $interval(sendToParse, 5000);

}]);