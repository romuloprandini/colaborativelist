(function () {
    'use strict';

    angular
        .module('colaborativelist.list')
        .run(routeConfig);

    routeConfig.$inject = ['routehelper'];
    /* @ngInject */
    function routeConfig(routehelper) {
        routehelper.configureRoutes(getRoutes());

        function getRoutes() {
            return [
                {
                    name: 'app.list',
                    config: {
                        cache: false,
                        url: 'list',
                        views: {
                            'list-tab': {
                                templateUrl: 'app/list/list.html',
                                controller: 'ListController',
                                controllerAs: 'vm'
                            } 
                        }
                    }
                },
                {
                    name: 'app.share', 
                    config: {
                        cache: false,
                        url: 'share/:id',
                        views: {
                            'list-tab': {
                                templateUrl: 'app/list/list-share.html',
                                controller: 'ListShareController',
                                controllerAs: 'vm'
                            } 
                        }
                    }
                }
            ];
        }
    }
})();