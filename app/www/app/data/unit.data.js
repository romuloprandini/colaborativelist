(function() {
    'use strict';
    
    angular
        .module('colaborativelist.data')
        .factory('unitData', unitData);
        
    function unitData() { 
        var service = {
            get: get,
            all: all
        },
        unitCollection = [{id:'U', name:'Unidades'},
                {id:'Ml', name:'Mililítros'},
                {id:'L', name:'Litros'},
                {id:'G', name:'Gramas'},
                {id:'Kg', name:'Kilogramas'}];
        
        
        
        return service;
        
        //FUNCTIONS
        function get(id) {
            var unit;
            all().forEach(function(value, index){
                if(value.id == id){
                    unit = value;
                    return;
                }
            });
            return unit;
        }

        function all() {
            return unitCollection;
        }        
    }
})();