
angular.module('carrinhofacil', ['ionic','ngResource' ,'carrinhofacil.controllers'])
.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    if(window.plugins == null) {
        window.plugins = {};
    }
    if(window.plugins.toast == null) {
        window.plugins.toast = {showShortTop: function(texto) { alert(texto); }
        };
     }
  });
})

.config(function($stateProvider, $urlRouterProvider, $resourceProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
  .state('app.main', {
    url: "/main",
    views: {
        'menuContent': {
            templateUrl: "templates/main.html",
            controller: 'MainCtrl'
        }
    }
  })
  .state('app.list', {
    url: "/list",
    views: {
      'menuContent': {
        templateUrl: "templates/list.html",
          controller: 'ListCtrl'
      }
    }
  })  
  .state('app.productList', {
    url: "/list/:id",
    views: {
      'menuContent': {
        templateUrl: "templates/productList.html",
          controller: 'productListCtrl'
      }
    }
  })
  .state('app.compare', {
    url: "/compare",
    views: {
      'menuContent': {
        templateUrl: "templates/compareProducts.html",
          controller: 'compareProductsCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/main');
});