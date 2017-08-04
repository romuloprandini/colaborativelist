
angular
    .module('colaborativelist.core')
    .run(run);
    
    run.$inject = ['$ionicPlatform', '$rootScope', 'config', 'userData'];
    
    function run($ionicPlatform, $rootScope, config, userData) {
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
        });
    }
