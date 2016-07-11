(function() {
    'use strict';

    angular
        .module('blocks.router')
        .provider('routehelperConfig', routehelperConfig)
        .factory('routehelper', routehelper);

    // Must configure via the routehelperConfigProvider
    function routehelperConfig() {
        /* jshint validthis:true */
        this.config = {
            resolve : '/'
            // These are the properties we need to set
            // resolveAlways: {ready: function(){ } }
        };

        this.$get = function() {
            return {
                config: this.config
            };
        };
    }

    routehelper.$inject = [
        '$location', '$rootScope', '$state',
        'logger', 'routehelperConfig'
    ];

    function routehelper(
        $location, $rootScope, $state,
        logger, routehelperConfig) {
        var handlingRouteChangeError = false;
        var routeCounts = {
            errors: 0,
            changes: 0
        };
        var routes = [];
        var $stateProvider = routehelperConfig.config.$stateProvider;
        var $urlRouterProvider = routehelperConfig.config.$urlRouterProvider;

        var service = {
            configureRoutes: configureRoutes,
            getRoutes: getRoutes,
            routeCounts: routeCounts
        };

        init();

        return service;
        ///////////////

        function configureRoutes(routes) {
            routes.forEach(function(route) {
                $stateProvider.state(route.name, route.config);
            });
            $urlRouterProvider.otherwise(routehelperConfig.config.resolve);
        }

        function handleRoutingErrors() {
            // Route cancellation:
            // On routing error, go to the dashboard.
            // Provide an exit clause if it tries to do it twice.
            $rootScope.$on('$routeChangeError',
                function(event, current, previous, rejection) {
                    if (handlingRouteChangeError) {
                        return;
                    }
                    routeCounts.errors++;
                    handlingRouteChangeError = true;
                    var destination = (current && (current.title || current.name || current.loadedTemplateUrl)) ||
                        'unknown target';
                    var msg = 'Error routing to ' + destination + '. ' + (rejection.msg || '');
                    logger.warning(msg, [current]);
                    $location.path(routehelperConfig.config.resolve);
                }
            );
        }

        function init() {
            handleRoutingErrors();
        }

        function getRoutes() {
            var stateRoutes = $state.get(); 
            for (var prop in stateRoutes) {
                if (stateRoutes.hasOwnProperty(prop)) {
                    var route = stateRoutes[prop];
                    routes.push(route);
                }
            }
            return routes;
        }
    }
})();