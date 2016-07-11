(function() {
    'use strict';
    
    angular
        .module('colaborativelist', [
            'colaborativelist.core',
            'colaborativelist.data',
            'colaborativelist.directive',
            'colaborativelist.filters',
            
            /* areas */
            'colaborativelist.layout',
            'colaborativelist.list',
            'colaborativelist.product',
            'colaborativelist.compare',
            'colaborativelist.user'
        ]);
        
})();