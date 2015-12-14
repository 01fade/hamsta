var angular = angular || {};

angular.module('app.controller.connectscreen', [])
.controller('ConnectScreenCtrl', function($scope, $rootScope, $location, $socket, $state, ParseService) {
	console.log("ConnectScreenCtrl.");
    $rootScope.title = $location.url();
    $scope.pairKey = "";
	// http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
    var possible = "0123456789";

	function keykeykey( callback ) {
		$scope.pairKey = "";
	    //create a unique key and send it to server
	    for( var i=0; i < 4; i++ ) {
	        $scope.pairKey += possible.charAt(Math.floor(Math.random() * possible.length));
	        if ($scope.pairKey.length == 4) {
			    console.log($scope.pairKey);
				$scope.$apply();
			    $socket.emit('pairKey', $scope.pairKey, function(data){
			    	$rootScope.myId = data;
			    	console.log($rootScope.myId);
			    });
			}
	    };
	    if (callback){ callback(); };
	};

	function fadeKeyIn(){
		//when the array is full then fade in the key
		if ($rootScope.heartsArray.length == 6 && $scope.pairKey !== ""){
			console.log("fadeKeyIn", $scope.pairKey, $("#key").html());
			$("#loading").fadeOut( function (){
				$("#key").fadeIn();
			});
		} else {
			console.log("key is empty, get key");
			keykeykey(function(){
				setTimeout(function(){
					fadeKeyIn();
				}, 1000);
			});
		}
	}

    $socket.on('get key', function(){
    	console.log("server says get key")
    	if( $scope.pairKey == "" ) {
    		console.log("key is empty, get key");
    		keykeykey();
    	} else {
		    console.log("already have key: " + $scope.pairKey);
		}
    })

    //when a mobile phone is connected
	$socket.on('matched', function (data) {
	    console.log(data);
	    $rootScope.partner = data.partner;
	    $state.transitionTo('TurnOn');
	});

	// $socket.on('refresh', function($scope){
	// 	$location.url('/start');
	// });

	//run this in background to fetch youtube data

	function getDataFromYT(callback) {
		for (var i = 0; i < $rootScope.vidArray.length; i++) {
		    // var sURL = "https://gdata.youtube.com/feeds/api/videos/" + $rootScope.vidArray[i].attributes.videoId + "?v=2&alt=json";
		    //https://developers.google.com/youtube/v3/getting-started#part
		    var sURL = "https://www.googleapis.com/youtube/v3/videos?id=" + $rootScope.vidArray[i].attributes.videoId + "&key=AIzaSyB-b88pv13kZrA2jg37BpZOo1mxvYtUBqI&part=snippet,statistics&fields=items(snippet(title),statistics(viewCount,commentCount))";
		    getInfo(sURL, i);
		};
		callback($rootScope.vidArray);
	}
	function getInfo (_sURL, i) {
	    $.getJSON( _sURL, function( data ) {
	    	// data from the getJSON
			// console.log("got "+i);
			// console.log(data);
		    // $rootScope.vidArray[i].title = data.items[0].snippet.title;
		    // don't store under attributes.count anymore - didn't show
		    $rootScope.vidArray[i].count = data.items[0].statistics.viewCount;
		    // $rootScope.vidArray[i].commentcount = data.items[0].statistics.commentCount;
		});
	}

	var d3data = [];
	function processData(array, vidlength, index, callback) {
		var counts = {};
		//array of times when hearted >> to one object with times and number of hearts
		for(var i = 0; i< array.length; i++) {
		    var num = array[i];
		    counts[num] = counts[num] ? counts[num]+1 : 1;
		};
		// console.log(counts);
		var newarr = [];
		var heartssum = 0;
		//take the object and turn into array of objects for every second and number of hearts
		Object.keys(counts).forEach(function (key) {
			newarr.push({time: key, hearts: counts[key] });
		});
		for (var i = 0; i < vidlength; i++) {
			if (counts[i] == undefined){ newarr.push({time: i, hearts: 0 });
			} else { heartssum = heartssum + newarr[i].hearts; }
		};
		newarr.sort(function(a, b) { return a.time - b.time; });
		// console.log(newarr);
		// console.log("hearts: " + heartssum);
		d3data.push(newarr);
		// console.log(d3data);
        callback({"array": d3data[index], "sum": heartssum});
	}

	//get the current Parse data and process it
	ParseService.getData(function(res) {
		$rootScope.vidArray = res;
		$rootScope.heartsArray = [];
		//http://stackoverflow.com/questions/1129216/sorting-objects-in-an-array-by-a-field-value-in-javascript
		function compare(a,b) {
		  if (a.attributes.channel < b.attributes.channel)
		     return -1;
		  if (a.attributes.channel > b.attributes.channel)
		    return 1;
		  return 0;
		}
		$rootScope.vidArray.sort(compare);

		getDataFromYT(function(data){
			console.log(data[0].attributes);
			for (i=0;i<data.length;i++) {
				//
				//
				//
				// CHANGE heartstest to hearts for real data
				//
				//
				//
				processData(data[i].attributes.hearts, data[i].attributes.duration, i, function(cbdata) {
					// console.dir(cbdata);
					$rootScope.heartsArray.push(cbdata);
					// console.log($rootScope.heartsArray);
				});
			}
			fadeKeyIn();
		});
	});


});


