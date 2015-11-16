var angular = angular || {};

angular.module('app.controller.tv', [])
.controller('TVCtrl', ['$rootScope', '$scope', '$location', '$socket', '$state', '$stateParams', '$interval', '$window', 'ParseService',
	function($rootScope, $scope, $location, $socket, $state, $stateParams, $interval, $window, ParseService) {
	console.log("TVCtrl.");
    $rootScope.title = $location.url();
    //comment this out for tests
    //otherwise it would always go to the start if screen is not matched
    //in timeiteration interval
    if($rootScope.partner == undefined) {$location.url('/start');};

	var promiseComments;
	var promiseTime;
	var currentTime;
	var volume = 50;
	var activechannel = Math.floor(Math.random()*(6))+1;
	var startArray = [0, 1044, 2070, 3011, 4012, 5015];
	var endArray = [1043, 2069, 3010, 4011, 5014, 6059];
	var commentsArray = [];
	var inCart = $rootScope.cartarray;

	listenchannel = function (_ch) {
		console.log($rootScope.vidArray);
		console.log($rootScope.vidArray.attributes);
		console.log("activechannel(listenchannel):" + _ch);
		var index = _ch - 1;
		$socket.emit('activechannel', {
			activechannel: _ch,
			partner: $rootScope.partner
		});

	    $("#channel").html("CHANNEL 0"+ _ch + "&nbsp; \t <span id='theme'>" + $rootScope.vidArray[index].attributes.theme + "</span>");
	    $("#volume").hide();
	    $("#channel").fadeIn();
	    setTimeout(function(){$("#channel").fadeOut();}, 10000);

	    //view count animation
		setTimeout(function(){
		    if ($rootScope.vidArray[index].count != undefined) {
		    	//keep adding 1 whenever you come back to channel
		    	$rootScope.vidArray[index].attributes.artificial = $rootScope.vidArray[index].attributes.artificial + 1;
		    	var str = numberWithCommas(parseInt($rootScope.vidArray[index].count) + $rootScope.vidArray[index].attributes.artificial);
		    	$("#viewcount").html("<span class='fa fa-users'></span> &nbsp;" + str);
		    	setInterval(function () {
		    		$("#viewcount").fadeToggle(2000, "swing");
				}, 1000);
		    };
		}, 1000);
	};

	function numberWithCommas(x) {
	    var parts = x.toString().split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    return parts.join(".");
	}

	/////////////////////////////////// SOCKET EVENTS ///////////////////////////////////

	//hearts animation
	$socket.on('heart update', function (){
		heartsNew();
	});

	$socket.on('plus', function($scope){
			$rootScope.vidArray[activechannel - 1].startTime = currentTime;
			if (activechannel == 6) { activechannel = 1;
			} else { activechannel++; };
			loadNewVid(activechannel);
	});

	$socket.on('minus', function($scope){
			$rootScope.vidArray[activechannel - 1].startTime = currentTime;
	 		if (activechannel == 1) { activechannel = 6;
			} else { activechannel--; };
			loadNewVid(activechannel);
	});

	$socket.on('turn off', function($scope){
		//before turn off save the cart in rootScope
		$rootScope.cartarray = inCart;
		console.log($rootScope.cartarray);
	    $state.transitionTo('TurnOn');
	});

	$socket.on('view cart', function($scope){
	    $("#shoplist").html(" ");
	    var total = 0;
	    for (var i = inCart.length - 1; i >= 0; i--) {
	        $("#shoplist").append('<li><img src="' + inCart[i].img + '"></li>').append('<p>- $' + inCart[i].price + ' -</p>');
	        if ($.isNumeric(inCart[i].price) == true) {
	            total = total + inCart[i].price;
	        };
	    };
	    if (total != undefined) {
	        $("#total").html("<b>TOTAL</b> &nbsp; $" + total);
	        $("#buynow").fadeIn();
	    } else {
	        $("#shoplist").html("Your cart is empty.")
	    };
	    $("#overlay").fadeIn();
	    $("#cart").removeClass("notify");

	    $socket.emit('cart content', {
	    	partner: $rootScope.partner,
	    	cart: inCart
	    })
	});

////////////////////////////////////////////testing

			$("#cart").click(function(){
			    $("#shoplist").html(" ");
			    var total = 0;
			    for (var i = inCart.length - 1; i >= 0; i--) {
			        $("#shoplist").append('<li><img src="' + inCart[i].img + '"></li>').append('<p>- $' + inCart[i].price + ' -</p>');
			        if ($.isNumeric(inCart[i].price) == true) {
			            total = total + inCart[i].price;
			        };
			    };
			    if (total != undefined) {
			        $("#total").html("<b>TOTAL</b> &nbsp; $" + total);
			        $("#buynow").fadeIn();
			    } else {
			        $("#shoplist").html("Your cart is empty.")
			    };
			    $("#overlay").fadeIn();

			    $socket.emit('cart content', {
			    	partner: $rootScope.partner,
			    	cart: inCart
			    })
			});

			$("#close").click(function(){
			    $("#overlay").fadeOut();
			});



	$socket.on('close cart', function($scope){
	    $("#overlay").fadeOut();
	});

	$socket.on('volume up', function($scope){
		if (volume == 100) {
			volume = 100;
		} else {
			volume = volume + 5;
		}
		changeVolume(volume);
	});

	$socket.on('volume down', function($scope){
		if (volume == 0) {
			volume = 0;
		} else {
			volume = volume - 5;
		}
		changeVolume(volume);
	});


//////////////////imitate plus and minus for testing
			    $(document).click(function(e) {
			        // console.log(e);
			        if (e.altKey) {
	        	    	$rootScope.vidArray[activechannel - 1].startTime = currentTime;
						if (activechannel == 6) { activechannel = 1;
						} else { activechannel++; };
						loadNewVid(activechannel);
			        } else if (e.shiftKey) {
			        	$rootScope.vidArray[activechannel - 1].startTime = currentTime;
				 		if (activechannel == 1) { activechannel = 6;
						} else { activechannel--; };
						loadNewVid(activechannel);
			        } else {
			        	heartsNew();
			        }
			    });
//////////////////end imitate plus and minus for testing

	var counteri = 0;
	function heartsNew () {
		//4 css options for animation
    	var num = Math.round(Math.random()*3);
    	$("#heartContainer").append('<span class="fa fa-heart fa-2x heart' + num +'"></span>');

    	$rootScope.heartsArray[activechannel-1].sum ++;
    	var time = Math.round($scope.bestPlayer.getCurrentTime());
    	$rootScope.heartsArray[activechannel-1].array[time].hearts ++;
    	var heartsAtTime = $rootScope.heartsArray[activechannel-1].array[time].hearts;
    	console.log(time, $rootScope.heartsArray);

		$scope.$apply(function(){
		    $scope.shared = { ourData:  $rootScope.heartsArray[activechannel-1].array };
		})
    	ParseService.updateHeartsSum(activechannel, $rootScope.heartsArray[activechannel-1].sum, function(data){
    		console.log("CH" + data.attributes.channel + " hearts " + data.attributes.heartssum);
    	});

    	ParseService.updateHearts(activechannel, currentTime, function(data){
    		console.log(data);
    	});

		var height = $("progress-bar").outerHeight();
        d3.select("rect").transition()
	        .duration(200)
			.attr("transform", "translate(" + 0 + "," + 0 + ")") //height set in css
			.each("end", function(){
				d3.select("rect").transition()
					.duration(700)
					.attr("transform", "translate(" + 0 + "," + height/3*2 + ")");
			})

	    counteri ++
	    //remove
	    if (counteri > 100) {
	        counteri = 0;
	        $("#heartContainer").html("");
	    };
	};

    function loadNewVid(_ch) {
    	console.log($rootScope.vidArray);
		listenchannel(_ch);
		$scope.bestPlayer.loadVideoById({
			'videoId': $rootScope.vidArray[_ch - 1].attributes.videoId,
			'startSeconds': $rootScope.vidArray[_ch - 1].startTime
		});
		start();
		console.log("activechannel: " + activechannel);
		//update the data for d3
		$scope.shared = { ourData:  $rootScope.heartsArray[activechannel-1].array};
		$scope.time = [currentTime, $rootScope.vidArray[activechannel-1].attributes.duration];
    }


	//////////////////////////// COMMENTS INIT //////////////////////////////
	////http://stackoverflow.com/questions/26447923/how-to-clear-or-stop-timeinterval-in-angularjs

    function showComments() {
        var index = activechannel - 1;
        var start = startArray[index];
        var i = start;
        var end = endArray[index];
        //if i reaches end of the array data >> restart
        if (i === end) {
            i = 0;
        }
        var list = $("#list");
        $("#list div").animate({ opacity: '-=0.2'}, 1000, "linear");
        if (commentsArray[i].comment.text === undefined) {
            list.append('<br><div id="comment' + i + '"><p>' + commentsArray[i].comment + '</p><p>' + commentsArray[i].username.text + ' <img src="' + commentsArray[i].pic.src + '"/>' + '</p></div>');
        } else {
            list.append('<br><div id="comment' + i + '"><p>' + commentsArray[i].comment.text + '</p><p>' + commentsArray[i].username.text + ' <img src="' + commentsArray[i].pic.src + '"/>' + '</p></div>');
        };
        var newcomment = $("#comment" + i);
        var height = newcomment.outerHeight() + 20;
        var count = $("#list div").length;
        //for the first one
        if (count == 1) {
            newcomment.animate({
                opacity: "1"
            }, 1000);
        } else {
            $("#list div:not(:last)").animate({ bottom: "+=" + height + "px" },
            	function() {
                newcomment.animate({ opacity: "1" }, 400);
        	});
        };
        //only have 5 comments in list at all times
        if (count > 5) {
            $("#list div:first").remove();
            $("#list br:first").remove();
        };
        i++;
        startArray[activechannel - 1] = i;
        // console.log(startArray);
    };

    function start() { // starts the interval
        // stops any running interval to avoid two intervals running at the same time
        stop();
        $("#list").fadeIn();
        // store the interval promiseComments
        promiseComments = $interval(showComments, 3000);
        promiseTime = $interval(timeIteration, 1000);
    };

    function stop() { // stops the interval
        $("#list").fadeOut().empty();
        $interval.cancel(promiseComments);
        $interval.cancel(promiseTime);
    };
	//////////////////////////// COMMENTS END //////////////////////////////

	function timeIteration () {
        currentTime = $scope.bestPlayer.getCurrentTime();
		$scope.time = [currentTime, $rootScope.vidArray[activechannel-1].attributes.duration];
		advertising(currentTime);

	    if($rootScope.partner == undefined) {$location.url('/start');};
	};

	//////////////////////////// START //////////////////////////////
	/////////////////////////////////////////////////////////////////

	//start here by random channel
	listenchannel(activechannel);
	//start video with activechannel
	$scope.theBestVideo = $rootScope.vidArray[activechannel-1].attributes.videoId;
	$scope.playerVars = { autoplay: 1, controls: 0, cc_load_policy: 0, iv_load_policy: 3, modestbranding: 1, autohide: 1, loop: 1, showinfo: 0};

	$scope.$on('youtube.player.playing', function ($event, player) {
		//start the intervals (time indicator, comments)
		start();
		// console.log("player playing");
	});

	$scope.$on('youtube.player.ready', function ($event, player) {
		$scope.bestPlayer.setVolume(volume);
		console.log("player ready")
	});

	$scope.$on('youtube.player.ended', function ($event, player) {
		player.playVideo();
	});

	function changeVolume () {
		$scope.bestPlayer.setVolume(volume);
		$("#channel").hide();
	    $("#volume").html("VOL &nbsp; \t <span id='theme'>"+ volume + "</span>").fadeIn();
	    setTimeout(function(){$("#volume").fadeOut();}, 1000);
	};

	////////////////////////// COMMENTS ////////////////////////////

	//get the comments, put in array
	$.getJSON("kimonoData.json", function(response) {
		commentsArray = response.results.kimono;
		console.log("comments length: " + commentsArray.length);
	});

	////////////////////////// D3 CHART ////////////////////////////

	console.log("active array length: " + $rootScope.heartsArray[activechannel-1].array.length);

	//nest, so parent doesn't get overwritten
	//start data
	$scope.shared = { ourData:  $rootScope.heartsArray[activechannel-1].array};
	$scope.time = [0, $rootScope.vidArray[activechannel-1].attributes.duration];

	angular.element($window).on('resize', function(){
		$scope.$apply();
		//the watch fct will fire in directive
	})

    $scope.$on('$destroy', function() {
      stop();
    });

	////////////////////////// ADVERTISING ////////////////////////////

    function advertising(_currentTime) {
      if (activechannel == 1) {
        if (_currentTime > 10 && _currentTime < 11) {
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +".jpg'>");
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 40, img: "img/"+ activechannel +".jpg"});
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };
        if (_currentTime > 105 && _currentTime < 106) {
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +"2.jpg'>");
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: " (Signup)", img: "img/"+ activechannel +"2.jpg"});
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };
        if (_currentTime > 200 && _currentTime < 201) {
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +"3.jpg'></img><img src='img/"+ activechannel +"4.jpg'></img>");
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 25, img: "img/"+ activechannel +"3.jpg"},{price: 15, img: "img/"+ activechannel +"4.jpg"});
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////        2         ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////


     } else if (activechannel == 2) {
        if (_currentTime > 133 && _currentTime < 134) {
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommend this.</button><img src='img/"+ activechannel +".jpg'></img>");
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 20, img: "img/"+ activechannel +".jpg"});
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };
        if (_currentTime > 160 && _currentTime < 161) {
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommend this.</button><img src='img/"+ activechannel +"2.jpg'></img>");
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 20, img: "img/"+ activechannel +"2.jpg"});
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////        3         ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

      } else if (activechannel == 3) {
        if (_currentTime > 55 && _currentTime < 56) {
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +".jpg'></img>");
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 424, img: "img/"+ activechannel +".jpg"});
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };
        if (_currentTime > 160 && _currentTime < 161) {
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +"2.jpg'></img>");
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 237, img: "img/"+ activechannel +"2.jpg"});
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////        4         ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

      } else if (activechannel == 4) {
        if (_currentTime > 10 && _currentTime < 11) {
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +".jpg'></img>");
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 16, img: "img/"+ activechannel +".jpg"});
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };
        if (_currentTime > 100 && _currentTime < 101) {
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +"2.jpg'></img>");
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 38, img: "img/"+ activechannel +"2.jpg"});
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////        5         ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

      } else if (activechannel == 5) {
        if (_currentTime > 30 && _currentTime < 31) {
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +".jpg'></img>");
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 10, img: "img/"+ activechannel +".jpg"});
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////        6         ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

      } else {
        if (_currentTime > 37 && _currentTime < 38) { //change time
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +".jpg'></img>"); //change url
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 7, img: "img/"+ activechannel +".jpg"}); //change price, url
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };
        if (_currentTime > 120 && _currentTime < 121) { //change time
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +"2.jpg'></img>"); //change url
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 29, img: "img/"+ activechannel +"2.jpg"}); //change price, url
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };
        if (_currentTime > 140 && _currentTime < 141) { //change time
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +"3.jpg'></img>"); //change url
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 5, img: "img/"+ activechannel +"3.jpg"}); //change price, url
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };
        if (_currentTime > 160 && _currentTime < 161) { //change time
          $("#forsale").html("<div id='added'>"+ $rootScope.vidArray[activechannel-1].attributes.ytname +" recommends this.</button><img src='img/"+ activechannel +"4.jpg'></img>"); //change url
          $("#forsale").slideDown(1000, "linear");
          setTimeout(function(){$("#forsale").slideUp(1000, "linear");}, 8000);
          inCart.push({price: 45, img: "img/"+ activechannel +"4.jpg"}); //change price, url
          $("#cartCount").html(" ( " + inCart.length + " )");
          $("#cart").addClass("notify");
        };
      };

	};


}]) //end controller


////////////////////////////// CHAINED DIRECTIVE //////////////////////////////////


.directive('lineChart', function(){
				  //src d3 directive!!! https://youtu.be/aqHBLS_6gF8
				  //lineChart = line-chart
				  //function starts when I have an line-chart element
				  function link(scope, el){
				    var data = scope.data;
				    // console.log(scope);
				    //select the line-chart element
				    var el = el[0];
				    //depends on line-chart css
				    var width = el.clientWidth;
				    var height = el.clientHeight;
				    var x = d3.scale.linear().range([0, width]);
				    //height is at bottom and 0 is at top
				    var y = d3.scale.linear().range([height, 0]);
				    //http://www.d3noob.org/2013/01/filling-area-under-graph.html
				    var area = d3.svg.area()
				      .x(function(d) { return x(d.time); })
				      .y0(height)
				      .y1(function(d) { return y(d.hearts); })
				        .interpolate("basis"); //curved line
				    var line = d3.svg.line()
				        .x(function(d) { return x(d.time); })
				        .y(function(d) { return y(d.hearts); })
				        .interpolate("basis");
				    //now actually append/draw
				    var svg = d3.select(el).append('svg').attr("width", width).attr("height", height)
				    x.domain(d3.extent(data, function(d) { return d.time; }));
				    y.domain(d3.extent(data, function(d) { return d.hearts; }));
				    var lline = svg.append("path")
				          .datum(data)
				          .attr("class", "linearea")
				          .attr("d", area);
				    var larea = svg.append("path")
				      .datum(data)
				      .attr("class", "line")
				      .attr("d", line);

				    //responsive
				    scope.$watch(function(){
				      //whenever this changes, next fct will fire
				      return el.clientWidth * el.clientHeight;
				    }, function(){
				      //everything that depends on width and height need to be updated
				      width = el.clientWidth
				      height = el.clientHeight
				      // scale the axis
				      x = d3.scale.linear().range([0, width]);
				      y = d3.scale.linear().range([height, 0]);
				      //so parent svg updates
				      svg.attr("width", width).attr("height", height);
				      //so the points is calculated
				      x.domain(d3.extent(data, function(d) { return d.time; }));
				      y.domain(d3.extent(data, function(d) { return d.hearts; }));
				      //so the line and area actually update
				      larea.datum(data).attr("class", "linearea").attr("d", area);
				      lline.datum(data).attr("class", "line").attr("d", line);
				    });

				    //on data array values change
				    scope.$watch('data', function(data){
				      console.log("data array values changed");
				      x = d3.scale.linear().range([0, width]);
				      y = d3.scale.linear().range([height, 0]);
				      svg.attr("width", width).attr("height", height);
				      //when 'data' (in $scope) changes
				      x.domain(d3.extent(data, function(d) { return d.time; }));
				      y.domain(d3.extent(data, function(d) { return d.hearts + d.hearts/10; }));

				          larea.transition()
				          .duration(500)
				          .attr("d", area(data));
				          lline.transition()
				          .duration(500)
				          .attr("d", line(data));
				    }, true) // true for watching the array more closely, not only the length


				    //on data.length change
				    scope.$watch('data', function(data){
				      console.log("data.length changed");
				      x = d3.scale.linear().range([0, width]);
				      y = d3.scale.linear().range([height, 0]);
				      svg.attr("width", width).attr("height", height);
				      //when 'data' (in $scope) changes
				      x.domain(d3.extent(data, function(d) { return d.time; }));
				      y.domain(d3.extent(data, function(d) { return d.hearts + d.hearts/10; }));

				          larea.transition()
				          .duration(10)
				          .style("opacity", 0)
				          .attr("d", area(data))
				          .each("end", function(){
				          	larea.transition()
					          .duration(800).style("opacity", 1);
				          });
				          lline.transition()
				          .duration(10)
				          .style("opacity", 0)
				          .attr("d", line(data))
				          .each("end", function(){
				          	lline.transition()
					          .duration(800).style("opacity", 1);
				          });
				    }, false) // true for watching the array more closely, not only the length


				  }
				  return {
				    link: link,
				    //only the element line-chart
				    restrict: 'E',
				    scope: { data: '=' }
				  }
})
.directive('progressBar', function(){
				  function link(scope, el){
				  	// simple bar chart: http://bl.ocks.org/mbostock/7322386
				  	// time, see in html <progress-bar>
				    var data = scope.data;
				    console.log(data);
				    var el = el[0];
				    var width = el.clientWidth;
				    var height = el.clientHeight;

					var x = d3.scale.linear()
					    .domain([0, d3.max(data)])
					    .range([0, width]);

					d3.select(el).append("svg").attr("width", width).append("rect");
					var rect = d3.selectAll("rect")
			                .attr("x", 0)
			                .attr("y", 0)
			                .attr("width", function(d) {
			                    // console.log(x(d));
			                    return x(d);
			                })
			                .attr("height", height * 2)
			                .style("fill", "rgba(255, 0, 0, 0.7)")
			                .attr("transform", "translate(" + 0 + "," + height / 2 + ")");

			        //responsive
			        scope.$watch(function() {
			            //whenever this changes, next fct will fire
			            return el.clientWidth * el.clientHeight;
			        }, function() {
			            width = el.clientWidth
			            height = el.clientHeight

			            x = d3.scale.linear()
			                .domain([0, d3.max(data)])
			                .range([0, width]);

			            d3.select("svg").attr("width", width).append("rect");
			            rect.data(data).transition().duration(500)
				            .attr("x", 0)
			                .attr("y", 0)
			                .attr("width", function(d) {
			                    // console.log(x(d));
			                    return x(d);
			                })
			                .attr("height", height * 2)
			                .style("fill", "rgba(255, 0, 0, 0.7)")
			                .attr("transform", "translate(" + 0 + "," + height / 2 + ")");
			        });

			        scope.$watch('data', function(data) {
			        	// console.log(">>>>> time changed");
			        	// update the relation time - total duration
						x = d3.scale.linear()
						    .domain([0, d3.max(data)])
						    .range([0, width]);

			            rect.data(data).transition().duration(500)
			                .attr("x", 0)
			                .attr("y", 0)
			                .attr("width", function(d) {
			                    // console.log(x(d));
			                    return x(d);
			                })
			                .attr("height", height*2)
			                .style("fill", "rgba(255, 0, 0, 0.7)")
			                .attr("transform", "translate(" + 0 + "," + height/3*2 + ")");
			        }, true);

				  }
				  return {
				    link: link,
				    restrict: 'E',
				    scope: { data: '=' }
				  }
});