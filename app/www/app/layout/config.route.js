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
                            controllerAs: 'vm'
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