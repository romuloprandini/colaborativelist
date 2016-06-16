(function() {
    'use strict';
    
    angular
        .module('colaborativelist.list')
        .controller('ProductController', ProductController);
        
    ProductController.$inject = ['$scope', '$filter', '$state', '$ionicScrollDelegate', 'common', 'config', 'productData'];
        
    function ProductController($scope, $filter, $state, $ionicScrollDelegate, common, config, productData) { 
        var vm = this;
        vm.translation = translation;
     
        // variables
        vm.query = {name: ''};
        vm.hasSearch = false;
        vm.productCollection = [];
        
        vm.order = 'name';
        vm.revert = false;
        vm.hideProductsChecked = false;
        vm.productsTotal = 0;
        vm.priceTotal = 0;
        vm.unitCollection = productData.unitCollection();
        vm.canEdit = true;
        vm.listId = 0;
        
        //Methods
        vm.edit = edit;
        vm.showSearch = showSearch;
        vm.showOptions = showOptions;
        vm.save = onSaveModal;
        vm.close = close;
        vm.hideCheckedProduct = hideCheckedProduct;
        vm.onCheck = onCheck;
        
        init();
        
        //FUNCTIONS
        function init() {
            
            if($state.params.id === undefined) {
                $state.go('app.list');
            }
            
            vm.listId = $state.params.id;
            vm.canEdit = ($state.params.canEdit == "true");
            
            $scope.$on(config.events.onDataChanged, function(event, data) {
                getProducts();
            });
            getProducts();
        }
        
        function getProducts() {
            common.loading.show(vm.translation.LOADING_LABEL + ' ' +vm.translation.PRODUCT_LABEL + ' ...');
            
            productData.list(vm.listId)
                .then(onSuccess)
                .finally(onFinally);
                
            function onSuccess(list) {
                vm.productCollection = list;
                updateProductsTotal();
                updatePriceTotal();
            }
            
            function onFinally() {
                common.loading.hide();
            }
        }
        
        function updateProductsTotal() {
            vm.productsTotal = 0;
            if(vm.productCollection !== undefined && vm.productCollection.length > 0) {
                vm.productsTotal = vm.productCollection.length;
            }
        }
        
        function updatePriceTotal() {
            var price = 0;
            if(vm.productCollection !== undefined && vm.productCollection.length > 0) {
                angular.forEach(vm.productCollection, function(product) {
                    price += (product.amount * product.price);
                });
            }
            
            vm.priceTotal = price;
        }
        
        function showSearch(show) {
            vm.hasSearch = show;
        }
        
        function edit(product) {
            if(!vm.canEdit) return;
            
            if(product === undefined) {
                vm.product = {_id: -1, name: '', price: '',  amount: '', measure: '', unit: '', checked: false};
                vm.oldData = {name : ''};
            } else {
                vm.product =  $filter('getById')(vm.productCollection, product._id);
                vm.oldData = angular.copy(vm.product);
            }
            common.modal.show('app/product/product-edit.html', $scope);
            common.popover.hide();
        }

        function onSaveModal() {
            save().then(function(params) {
                updateProductsTotal();
                updatePriceTotal();
                
                common.modal.hide();
            })
        }

        function save() {
            if(!vm.canEdit) return;
            
            vm.product.oldName = vm.oldData.name;
            return productData.save(vm.listId, vm.product).then(function (result) {
                if(vm.product._id < 0) {
                    vm.product._id = vm.productCollection.length; 
                } else {
                    vm.productCollection.splice(vm.product._id, 1);
                }
                
                vm.productCollection.push(vm.product);
                vm.oldData = null;
                vm.product = null;
            });
        }
                
        function remove(product) {
            if(!confirm(vm.translation.CONFIRM_DELETING_PRODUCT.replace('PRODUCT_NAME', product.name))) {
                return;
            }
            common.popover.hide();
            var indexOf = vm.productCollection.indexOf(product);
            productData.remove(vm.listId, product._id)
            .then(onSuccess)
            function onSuccess(result) {
            
                if (result) {
                    vm.productCollection.splice(indexOf, 1);
                }
            }
        }
        
        function close() {
            if (vm.oldData !== undefined)
            {
                angular.copy(vm.oldData, vm.product);
                vm.oldData = null;
            }
            common.modal.hide();
        };
     
        function hideCheckedProduct() {
            vm.hideProductsChecked = !vm.hideProductsChecked;
        }
       
        function onCheck (product) {
            if(!vm.canEdit) {
                product.checked = !product.checked;  
                return;
            }
            vm.product = $filter('getById')(vm.productCollection, product._id);
            vm.oldData = {name : vm.product.name};
            save();
            var position = $ionicScrollDelegate.$getByHandle('listProductsScroll').getScrollPosition();
            $ionicScrollDelegate.scrollTo(position.left, position.top, false);
        }
        
        function order(order) {
            if(vm.order != order) {
                vm.order = order;
                vm.revert = false;
            }
            else {
                vm.revert = !vm.revert;
            }
            common.popover.hide();
        }

        function verifyOrder(order) {
            if(vm.order == order) {
                if(vm.revert) {return 'fa fa-sort-amount-desc';} else {return 'fa fa-sort-amount-asc';}
            }
            return '';
        }
    
        vm.openOrder = function($event) {
            $scope.optionCollection = [{name: vm.translation.NAME_LABEL, action: function() {order('name')}, classe: '', icon: {right: verifyOrder('name')}},
                                {name: vm.translation.PRICE_LABEL, action: function() {order('price')}, classe: '', icon: {right: verifyOrder('price')}},
                                {name: vm.translation.AMOUNT_LABEL, action: function() {order('amount')}, icon: {right: verifyOrder('amount')}}];
            common.popover.show($event, $scope);
        };
        
        function showOptions($event, product) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.optionCollection = [{name: vm.translation.EDIT_LABEL, action: function() {edit(product)}, classe: '', icon: {left:'icon-left ion-compose'}},
                                {name: vm.translation.DELETE_LABEL, action: function(){ remove(product)}, classe: '', icon: {left:'icon-left ion-trash-a'}}];

            common.popover.show($event, $scope);
        }
    }
})();