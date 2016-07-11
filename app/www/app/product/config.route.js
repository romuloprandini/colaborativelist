(function () {
    'use strict';

    angular
        .module('colaborativelist.product')
        .run(routeConfig);

    routeConfig.$inject = ['routehelper'];
    
    function routeConfig(routehelper) {
        routehelper.configureRoutes(getRoutes());

        function getRoutes() {
            return [
                {
                    name: 'app.products',
                    config: {
                        url: 'products/:id/:canEdit',
                        views: {
                            'list-tab': {
                                templateUrl: 'app/product/product-list.html',
                                controller: 'ProductController',
                                controllerAs: 'vm'
                            } 
                        }
                    }
                }
            ];
        }
    }
})();