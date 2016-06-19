
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
            
            
            $rootScope.username = config.guestName;
            
            $rootScope.$on(config.events.onDatabaseConfigurated, function(event, data) {
                console.log("iniciando run");
                userData.get().then(function(user) {
                    console.log("pegou usuario");
                    $rootScope.username = data.name;
                }).finally(function() {
                    console.log("removeu o splashscreen");
                    if(navigator.splashscreen)
                        navigator.splashscreen.hide();
                });
            });
            
            $rootScope.$on(config.events.onLogin, function(event, data) {
                $rootScope.username = data.name;
            });
            $rootScope.$on(config.events.onLogout, function(event, data) {
                $rootScope.username = data.name;
            });
        });
    }
