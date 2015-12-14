var angular = angular || {};

// Our main JavaScript file
// Init Angular world by linking to 'myApp' namespace we declared in <body>
// in [ ], we add any dependencies used for the project
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

    //app key, js key
    Parse.initialize("MdRE1kDbDdzLGlnL58RylsrgHedWuyt5havoBScC", "oIeP9WumrqoPgFV5StUEfIK58xbQOtUgFf6e7RPk");

  })
  //options of each services, chained to .run
  //no angular services in there
  .config(function($socketProvider){
    //IMPORTANT CHANGE WHEN MOVING TO DIFFERENT SERVER
    $socketProvider.setConnectionUrl('http://my.hamsta.us');
    // $socketProvider.setConnectionUrl('http://192.168.1.31:3000');
    // $socketProvider.setConnectionUrl('http://10.0.1.19:3000');
    // $socketProvider.setConnectionUrl('http://149.31.134.39:3000');
  });