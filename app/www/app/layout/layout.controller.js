(function() {
    'use strict';
    
    angular
        .module('colaborativelist.layout')
        .controller('LayoutController', LayoutController);
    
    LayoutController.$inject = ['configureServiceData'];
    
    function LayoutController(configureServiceData) {
      console.log('on configure service return', configureServiceData);

      if(navigator.splashscreen) {
          navigator.splashscreen.hide();
          console.log("removeu o splashscreen");
      }
    }
})();