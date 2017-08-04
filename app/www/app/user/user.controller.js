(function() {
    'use strict';
    
    angular
        .module('colaborativelist.user')
        .controller('UserController', UserController);
    
    UserController.$inject = ['$scope', '$state', '$ionicHistory', '$ionicSideMenuDelegate', 'common', 'config', 'userData'];
    
    function UserController($scope, $state, $ionicHistory, $ionicSideMenuDelegate, common, config, userData) {
        var vm = this;
        vm.translation = translation;
        vm.isLoadingUser = isLoadingUser;
        vm.userReady = false;
        vm.user = {};
        vm.isGuest = isGuest;
        vm.close = close;
        vm.showSignUp = showSignUp;
        vm.create = createUser;
        vm.login = login;
        vm.logout = logout;
        
        init();
        
        function init() {
          console.log('entrou user Controller');
            userData.get().then(function(user) {
            console.log('UserController - teve que buscar usuario: ', user);
                $scope.user = user;
                $scope.username = user.name;
                vm.user = user;
            })
            .finally(function() {
                vm.userReady = true;
            });
        }
        
        function isLoadingUser() {
            return !vm.userReady;
        }
                
        function isGuest() {
            return (vm.user === undefined || userData.isGuest(vm.user.name));
        }
        
        function close() {
            common.modal.hide();
        }
        
        function showSignUp() {
            vm.newUser = {};
            common.modal.show('app/user/user-create.html',$scope);
        }
        
        function createUser() {
            common.loading.show(vm.translation.LOADING_SIGNUP);
            userData.create(vm.newUser).then(function(response) {
                common.modal.hide();
                common.toastr('success', vm.translation.SIGNUP_SUCCESS.replace('USERNAME', response.name));
            })
            .finally(function(){
                common.loading.hide();
            })
        }
        
        function login() {
            vm.data = {};
            var options = {
                templateUrl: 'app/user/login.html',
                title: vm.translation.LOGIN_LABEL,
                scope: $scope,
                buttons: [
                    { text: vm.translation.CANCEL_LABEL, },
                    {
                        text: '<b>'+vm.translation.LOGIN_LABEL+'</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            e.preventDefault();
                            onLogin();
                        }
                    }
                ]
            }
            common.popup.show(options);
            
            function onLogin() {
                common.loading.show(vm.translation.LOGING_LABEL + ' ...');
                
                userData.login(vm.data.user, vm.data.password).then(function(user) {
                    vm.user = user;
                    common.popup.hide();
                })
                .finally(function() {
                    common.loading.hide();
                })
                return true;
            }
        }
        
        function logout() {
            common.loading.show(vm.translation.LOGOUTING_LABEL + ' ...');
                
            userData.logout().then(function(user){
                vm.user = user;
            })
            .finally(function() {
                common.loading.hide();
            });
        }
    }
})();