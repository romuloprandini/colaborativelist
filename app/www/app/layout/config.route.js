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
                              'configureServiceData': function(configureService) {
                                return configureService.configure();
                              }
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