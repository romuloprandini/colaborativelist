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
                    name: 'app.productList',
                    config: {
                        url: 'list/:id/:canEdit',
                        views: {
                            'pageContent@': {
                                templateUrl: 'app/product/product-list.html',
                                controller: 'ProductController',
                                controllerAs: 'vm',
                                resolve: {
                                    'productDataResolver': ['productData', function(productData) {
                                        console.log('entrou productDataResolver');
                                        return productData.ready();
                                    }]
                                }
                            } 
                        }
                    }
                }
            ];
        }
    }
})();