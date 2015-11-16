var angular = angular || {};

// Main JavaScript file
// Init Angular world by linking to 'myApp' namespace declared in <body>
// in [ ], add any dependencies used for the project
// `ui.router` is reserved by ui.router library

angular.module('myApp', ['ui.router',
  'app.router',
  'app.services',
  'app.controller.start',
  'app.controller.connectremote',
  'app.controller.connectscreen',
  'app.controller.turnon',
  'app.controller.tv',
  'app.controller.remotecontrol',
  'app.controller.buy',
  'app.controller.cart',
  'socket.io',
  'youtube-embed',
  'mn',
  'ngAnimate'
])
  .run(function($rootScope, $state, $location) {
    console.log('ROOT ROOT ROOT RUN RUN RUN');

    $rootScope.vheight = window.innerHeight;
    $rootScope.vwidth = window.innerWidth;
    //start with empty cart
    $rootScope.cartarray = [];

    //parse app key, js key
    Parse.initialize("APPKEY", "JSKEY");

  })
  //options of each services, chained to .run
  //no angular services in there
  .config(function($socketProvider){
    //Server:Port e.g. "http://192.168.1.31:3000"
    $socketProvider.setConnectionUrl('SERVER:PORT');
  });