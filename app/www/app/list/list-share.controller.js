(function() {
    'use strict';
    
    angular
        .module('colaborativelist.list')
        .controller('ListShareController', ListShareController);
    
    ListShareController.$inject = ['$scope', '$state', '$location', 'common', 'listData', 'userData'];
    
    function ListShareController($scope, $state, $location, common, listData, userData) { 
        var vm = this;
        vm.translation = translation;
        
        vm.list_id = 0;        
        vm.items = [];
        vm.search = '';
        vm.selected = true;
        vm.loading = false;
        vm.userList = [];
        vm.permission = 'edit';
        
        //Methods
        vm.isCurrectUser = isCurrectUser;
        vm.getPermissionIcon = getPermissionIcon;
        vm.getPermissionText = getPermissionText;
        vm.changePermission = changePermission;
        vm.clear = clear;
        vm.onChange = onChange;
        vm.onSelectUser = onSelectUser;
        vm.remove = remove;
        vm.save = save;
        
        init();
    
   function init() {
        if($state.params.id === undefined || ($state.params.id !== undefined && $state.params.id == "")) {
            common.toast.showBottom(vm.translation.INVALID_LIST);
            $state.go('app.list');
            return;
        }
        
        common.loading.show(vm.translation.LOADING_LABEL + ' ' +vm.translation.LIST_SHARE_LABEL + ' ...');
        listData.get($state.params.id, $scope.username).then(function(list) {
            vm.list_id = $state.params.id;
            vm.userList = list.userList;
        }).finally(function() {
            common.loading.hide();
        });
    }
    
    function isCurrectUser(userName) {
        return (userName == $scope.username);
    }
    
    function setPermission(permission, index) {
        if(index == undefined) {
            vm.permission = permission;
        } else {
            vm.userList[index].permission = permission; 
        }
        common.popover.hide();
    }
    
    function getPermissionIcon(permission) {
        return ((permission == 'edit') ? 'ion-edit' : 'ion-eye');
    }
    
    function getPermissionText(permission) {
        return ((permission == 'edit') ? vm.translation.EDIT_LABEL : vm.translation.VISUALIZE_LABEL);
    }
    
    function changePermission($event, index) {
        $scope.optionCollection = [{name: vm.translation.EDIT_LABEL, action: function() {setPermission('edit', index)}, classe: '', icon: {left:'icon-left ion-edit'}},
                              {name: vm.translation.VISUALIZE_LABEL, action: function(){ setPermission('read', index)}, classe: '', icon: {left:'icon-left ion-eye'}}];
        
        common.popover.show($event, $scope);
    }   
    function clear() {
        vm.search = '';
        vm.selected = true;
    }
    
    function userAlreadyInList(userName) {
        var exists = false;
        vm.userList.forEach(function(userpermited) {  
            if(userName == userpermited.name) {
                exists = true;
                return;
            }
        });
        return exists;
    }

    function onChange() {
        if(vm.search.length < 3) {
            return;
        }
        vm.loading = true;
        userData.search(vm.search).then(function(data) {
            vm.items = [];
            if(data != undefined) {
                data.forEach(function(user) {
                    if(!userAlreadyInList(user.name)) {
                        vm.items.push(user);
                    }
                });
            }
            vm.loading = false;
            vm.selected = false;
        });
    }    
    
    function onSelectUser(user) {
        vm.selected = true;
        if(!userAlreadyInList(user.name)) {
            var newUser = {name: user.name, permission: vm.permission};
            vm.userList.push(newUser);
        }
    };
    
    function remove(index) {
        vm.userList.splice(index,1);
    }
    
    function save() {
        listData.share(vm.list_id, vm.userList).then(function(data){
           if(data) {
               common.toastr('success', vm.translation.SHARED_SAVE_SUCCESS);
           } 
        });
    }
}
})();