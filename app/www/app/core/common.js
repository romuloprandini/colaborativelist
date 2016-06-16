(function() {
    'use strict';
    
    angular
        .module('colaborativelist.core')
        .factory('common', common);
        
        common.$inject = ['$rootScope', '$q', '$timeout', '$ionicModal',  '$ionicLoading', '$ionicScrollDelegate', '$ionicPopup', '$ionicPopover', 'logger', 'exception', 'toastr'];
        
        function common($rootScope, $q, $timeout, $ionicModal, $ionicLoading, $ionicScrollDelegate, $ionicPopup, $ionicPopover, logger, exception, toastr) {
            
            var service = {
                $broadcast: $broadcast,
                $q: $q,
                $timeout: $timeout,
                toastr: showToastr,
                exception: exception,
                loading : loading(),
                popover: popover(),
                popup: popup(),
                modal: modal(),
            }
            
            return service;
            
            //FUNCTIONS'
         
            function $broadcast() {
                return $rootScope.$broadcast.apply($rootScope, arguments);
            }
            
            function showToastr(type, message, title) {
                if(type == 'error') {
                    toastr.error(message, title);
                } else if(type == 'warning') {
                    toastr.warning(message, title);
                } else if(type == 'success') {
                    toastr.error(message, title);
                } else {
                    toastr.info(message, title);
                } 
            }
            
            function loading() {
                var service = {
                        show: show,
                        hide: hide
                    }
                
                return service;
                
                function show(message) {
                    $ionicLoading.show({
                    template: '<div><ion-spinner style="float:left"></ion-spinner><div style="float:left; margin-left:10px;margin-top:5px">'+message+'</span></div>'
                    });
                }
                
                function hide() {
                    $ionicLoading.hide();
                }
            }
            
            function popover() {
                var popover,
                    service = {
                        show: show,
                        hide: hide
                    }
                    
                return service;
                
                //FUNCTIONS
                
                function show(event, scope) {
                    if(popover !== undefined) {
                        popover.remove();
                    }
                    $ionicPopover.fromTemplateUrl('app/layout/popover.html', {
                        scope: scope
                    }).then(function(p) {
                        popover = p;
                        popover.show(event);
                    });
                }
                
                function hide() {
                    if(popover != null) {
                        popover.hide();
                        popover.remove();
                    }
                }
            }
            
            function popup() {
                var popup,
                    service = {
                        show: show,
                        hide: hide
                    }
                return service;
                
                //FUNCTIONS 
                
                function show(options) {
                    popup = $ionicPopup.show(options);
                }
                
                function hide() {
                    //$ionicPopup.close();
                    popup.close();
                }
            }
            
            function modal() {
                var modal,
                    service = {
                        show: show,
                        hide: hide
                    }
                return service;
                
                //FUNCTIONS
                
                function show(template, scope) {
                    $ionicModal.fromTemplateUrl(template, {
                        scope: scope
                    }).then(function(m) {
                        modal = m;
                        modal.show();
                    });
                }
                
                function hide() {
                    //$ionicModal.hide();
                    modal.hide();
                    //$ionicModal.remove();
                    modal.remove();
                }
            }
        }

})();