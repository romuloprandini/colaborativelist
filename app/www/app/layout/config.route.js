(function () {
    'use strict';

    angular
        .module('colaborativelist.layout')
        .run(routeConfig);

    routeConfig.$inject = ['routehelper'];
    
    function routeConfig(routehelper) {
        routehelper.configureRoutes(getRoutes());
    }

    function getRoutes() {
        return [
            {
                name: 'app',
                config: {
                    url: '/',
                    views : {
                        'pageContent' : {
                            templateUrl: 'app/layout/layout.html',
                            controller: 'LayoutController',
                            controllerAs: 'vm',
                            resolve: {
                              'configureResolver': ['$rootScope', 'userData', 'common', function($rootScope, userData, common) {
                                console.log('entrou configureResolver');
        
                                var promisseUser = userData.get()
                                .then(function(user) {
                                console.log('Configure app - pegou o usuario: ', user);
                                    $rootScope.user = user;
                                    $rootScope.username = user.name;
                                    return common.$q.when(true);
                                });
                                
                                var defered = common.$q.defer();
                                var interval = setInterval(function(){ 
                                    if(translation.LANGUAGE !== undefined) {
                                    console.log('Configure app - pegou o idioma');
                                    defered.resolve(true);
                                    clearInterval(interval);
                                    }
                                }, 100);
                                var promisseLanguage = defered.promise;
                                
                                return common.$q.all([promisseUser, promisseLanguage])
                                .then(function (promisses) {
                                    console.log('Configure app - completou as configurações');
                                    if(navigator.splashscreen) {
                                        navigator.splashscreen.hide();
                                    }
                                    return true;
                                });

                              }]
                            }
                        },
                        'sideMenuContent' : {
                            templateUrl: 'app/layout/sidemenu.html',
                            controller: 'SideMenuController',
                            controllerAs: 'vm'
                        }
                    }
                }
            }
        ];
    }
})();