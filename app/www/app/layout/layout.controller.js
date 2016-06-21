(function() {
    'use strict';
    
    angular
        .module('colaborativelist.layout')
        .controller('LayoutController', LayoutController);
    
    LayoutController.$inject = ['configureServiceData'];
    
    function LayoutController(configureServiceData) {
      if(navigator.splashscreen) {
          navigator.splashscreen.hide();
      }
    }
})();