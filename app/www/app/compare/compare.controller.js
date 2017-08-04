(function() {
    'use strict';
    
    angular
        .module('colaborativelist.compare')
        .controller('CompareController', CompareController);
        
    CompareController.$inject = ['$scope', '$filter', '$state', 'common', 'config'];
        
    function CompareController($scope, $filter, $state, common, config) { 
        var vm = this;
        vm.translation = translation;
        
        init();
        
        //FUNCTIONS
        function init() {
            console.log('entrou compare Controller');
        }
    }
})();