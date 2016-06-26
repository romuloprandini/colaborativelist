(function() {
    'use strict';
    
    angular
        .module('colaborativelist.layout')
        .controller('LayoutController', LayoutController);
    
    LayoutController.$inject = ['configureServiceData'];
    
    function LayoutController(configureServiceData) {
      console.log('terminou carregar as Configurações do APP');
    }
})();