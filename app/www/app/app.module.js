(function() {
    'use strict';
    
    angular
        .module('colaborativelist', [
            'colaborativelist.core',
            'colaborativelist.data',
            'colaborativelist.directive',
            'colaborativelist.filters',
            
            /* areas */
            'colaborativelist.user',
            'colaborativelist.product',
            'colaborativelist.layout',
            'colaborativelist.list'
        ]);
        
})();