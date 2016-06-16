(function() {
    'use strict';
    
    angular
        .module('colaborativelist.list')
        .controller('ListController', ListController);
        
    ListController.$inject = ['$scope', '$filter', '$state', 'common', 'config', 'listData'];
        
    function ListController($scope, $filter, $state, common, config, listData) { 
        var vm = this;
        vm.translation = translation;
     
        // variables
        vm.query = {name: ''};
        vm.hasSearch = false;
        vm.listCollection = [];
        
        //Methods
        vm.edit = edit;
        vm.showSearch = showSearch;
        vm.showOptions = showOptions;
        vm.goProducts = goProducts;
        
        init();
        
        //FUNCTIONS
        function init() {
            $scope.$on(config.events.onDataChanged, function(event, data) {
                getLists();
            });
            getLists();
        }
        
        function getLists() {
            common.loading.show(vm.translation.LOADING_LABEL + ' ' +vm.translation.LIST_LABEL + ' ...');
            
            listData.list($scope.username)
                .then(onSuccess)
                .finally(onFinally);
                
            function onSuccess(list) {
                vm.listCollection = list;
            }
            
            function onFinally() {
                common.loading.hide();
            }
        }
        
        function showSearch(show) {
            vm.hasSearch = show;
        }
        
        
        function showPopupEditList(onSave, onCancel) {
            var options = {
                templateUrl: 'app/list/list-edit.html',
                title: vm.translation.LIST_LABEL,
                scope: $scope,
                buttons: [
                  { text: vm.translation.CANCEL_LABEL, 
                    onTap: onCancel
                  },
                  {
                    text: '<b>'+vm.translation.SAVE_LABEL+'</b>',
                    type: 'button-positive',
                    onTap: onSave
                  }
                ]
            }
            common.popup.show(options);
        }
        
        function edit(list) {
            if(list === undefined) {
                vm.list = {_id: 0, name: ''};
            } else {
                vm.list =  list;
                vm.oldData = angular.copy(vm.list);
                common.popover.hide();
            }
            showPopupEditList(onSave, onCancel);
        }
        
        function onCancel() {
            if (vm.oldData !== undefined)
            {
                angular.copy(vm.oldData, vm.list);
                vm.oldData = null;
            }
        }
        
        function onSave(e) {
            if(e !== undefined) {
                e.preventDefault();
            }
            listData.save(vm.list, $scope.username)
                .then(onSuccess);
                
            function onSuccess(list) {
                var oldList = $filter('getById')(vm.listCollection, list._id);
                if (oldList != null) {
                    var index = vm.listCollection.indexOf(oldList);
                    vm.listCollection.splice(index, 1);
                } 
                vm.listCollection.push(list);
                vm.list = null;
                vm.oldData = null;
                common.popup.hide();
            }
        }
        
        function remove(list) {
            if(!confirm(vm.translation.CONFIRM_DELETING_LIST.replace('LIST_NAME', list.name))) {
                return;
            }
            common.popover.hide();
            var indexOf = vm.listCollection.indexOf(list);
            listData.remove(list._id, $scope.username)
            .then(onSuccess)
            
            function onSuccess(result) {
                if (result) {
                    vm.listCollection.splice(indexOf, 1);
                }
            }
            
        }
        
        function sync(list) {
            listData.sync(list, $scope.username)
            .then(onSuccess)
            function onSuccess(list) {
                var oldList = $filter('getById')(vm.listCollection, list._id);
                if (oldList != null) {
                    var index = vm.listCollection.indexOf(oldList);
                    vm.listCollection.splice(index, 1);
                } 
                vm.listCollection.push(list);
                common.popover.hide();
            }

        }
        
        function share(id) {
            common.popover.hide();
            $state.go('app.list.share', {id: id});
        }
        
        function showOptions($event, list) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.optionCollection = [{name: vm.translation.EDIT_LABEL, action: function() {edit(list)}, classe: '', icon: {left:'icon-left ion-compose'}},
                                {name: vm.translation.DELETE_LABEL, action: function(){ remove(list)}, classe: '', icon: {left:'icon-left ion-trash-a'}}];
            if(list.canSync) {
                $scope.optionCollection.push({name: vm.translation.SYNC_LABEL, action: function(){ sync(list)}, classe: '', icon: {left:'icon-left ion-loop'}})
            }
            if(!list.isGuest) {
                $scope.optionCollection.push({name: vm.translation.SHARE_LABEL, action: function(){ share(list._id)}, classe: '', icon: {left:'icon-left ion-share'}})
            }

            common.popover.show($event, $scope);
        }
        
        function goProducts(list) {
            $state.go('app.productList',{id: list._id, canEdit: list.canEdit});
        }
    }
})();