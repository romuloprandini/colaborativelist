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
                    abstract: true,
                    url: '/',
                    views : {
                        'pageContent' : {
                            templateUrl: 'app/layout/layout.html',
                            resolve: {
                              'configureResolver': ['$rootScope', 'common', 'configureService', 'userData', function($rootScope, common, configureService, userData) {
                                console.log('entrou configureResolver');
                                                               
                                return configureService.configure()
                                .then(function (promisses) {
                                    console.log('Configure app - completou as configurações');
                                    
                                    return userData.get()
                                        .then(function(user) {
                                        console.log('Configure app - pegou o usuario: ', user);
                                            $rootScope.user = user;
                                            $rootScope.username = user.name;
                                            return common.$q.when(true);
                                        });
                                });

                              }]
                            }
                        }
                    }
                }
            }
        ];
    }
})();