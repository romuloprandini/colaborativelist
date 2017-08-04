(function () {
    'use strict';

    angular
        .module('colaborativelist.user')
        .run(routeConfig);

    routeConfig.$inject = ['routehelper'];
    /* @ngInject */
    function routeConfig(routehelper) {
        routehelper.configureRoutes(getRoutes());

        function getRoutes() {
            return [
                {
                    name: 'app.user',
                    config: {
                        cache: false,
                        url: 'user',
                        views: {
                            'user-tab': {
                                templateUrl: 'app/user/user.html',
                                controller: 'UserController',
                                controllerAs: 'vm'
                            } 
                        }
                    }
                }
            ];
        }
    }
})();