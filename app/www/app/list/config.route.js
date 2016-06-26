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
                            'pageContent@': {
                                templateUrl: 'app/list/list.html',
                                controller: 'ListController',
                                controllerAs: 'vm'
                            } 
                        },
                        settings: {
                            nav: 1,
                            content: {
                                icon: 'fa fa-th-list',
                                text: 'LIST_LABEL'
                            }
                        }
                    }
                },
                {
                    name: 'app.list.share', 
                    config: {
                        cache: false,
                        url: 'share/:id',
                        views: {
                            'pageContent@': {
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