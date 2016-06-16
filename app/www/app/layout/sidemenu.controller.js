(function() {
    'use strict';
    
    angular
        .module('colaborativelist.layout')
        .controller('SideMenuController', SideMenuController);
    
    SideMenuController.$inject = ['$scope','routehelper', '$state'];
    
    function SideMenuController($scope, routehelper, $state) {
        var vm = this;
        vm.translation = translation; 
        vm.isCurrent = isCurrent;
        vm.routes = routehelper.getRoutes();
        
        activate();

        function activate() {
            getNavRoutes();
        }
                 
        function getNavRoutes() {
            vm.navRoutes = vm.routes.filter(function(r) {
                return r.settings && r.settings.nav;
            }).sort(function(r1, r2) {
                return r1.settings.nav - r2.settings.nav;
            });
        }

        function isCurrent(route) {
            if (!route.title || !$state.current || !$state.current.title) {
                return '';
            }
            var menuName = route.title;
            return $state.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
        }
    }        
})();