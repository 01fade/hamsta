var angular = angular || {};

angular.module('app.router', [])
  //http://www.amasik.com/angularjs-ngroute-vs-ui-router/
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('Start', {
        url: '/start',
        templateUrl: 'views/start.html',
        controller: 'StartCtrl'
      })
      .state('ConnectScreen', {
        url: '/connectscreen',
        templateUrl: 'views/connectscreen.html',
        controller: 'ConnectScreenCtrl'
      })
      .state('ConnectRemote', {
        url: '/connectremote',
        templateUrl: 'views/connectremote.html',
        controller: 'ConnectRemoteCtrl'
      })
      .state('TurnOn', {
        url: '/turnon',
        templateUrl: 'views/turnon.html',
        controller: 'TurnOnCtrl'
      })
      .state('RemoteControl', {
        url: '/remotecontrol',
        templateUrl: 'views/remotecontrol.html',
        controller: 'RemoteControlCtrl'
      })
      .state('TV', {
        url: '/tv',
        templateUrl: 'views/tv.html',
        controller: 'TVCtrl'
      })
      .state('Cart', {
        url: '/cart',
        templateUrl: 'views/cart.html',
        controller: 'CartCtrl'
      })
      .state('Buy', {
        url: '/buy',
        templateUrl: 'views/buy.html',
        controller: 'BuyCtrl'
      })
      // Set default state
    $urlRouterProvider.otherwise('/start');
  });