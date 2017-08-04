(function () {
    'use strict';

    angular
        .module('colaborativelist.compare')
        .run(routeConfig);

    routeConfig.$inject = ['routehelper'];
    /* @ngInject */
    function routeConfig(routehelper) {
        routehelper.configureRoutes(getRoutes());

        function getRoutes() {
            return [
                {
                    name: 'app.compare',
                    config: {
                        cache: false,
                        url: 'compare',
                        views: {
                            'compare-tab': {
                                templateUrl: 'app/compare/compare.html',
                                controller: 'CompareController',
                                controllerAs: 'vm'
                            } 
                        }
                    }
                }
            ];
        }
    }
})();