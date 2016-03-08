angular.module('colaborativelist.controllers', ['ionic', 'colaborativelist.filters', 'colaborativelist.services', 'colaborativelist.directives'])

.controller('AppCtrl', function($scope, $state, $ionicModal,  $ionicLoading, $ionicScrollDelegate, $ionicPopover, $timeout, DatabaseService, TranslationService, $cordovaToast, $ionicPlatform, $ionicPopup) {
    $scope.databaseService = DatabaseService();

    TranslationService.getTranslation($scope, 'pt-br');

    function isConfigurated() {
        var configurated = false;
        return {
            get: function() {
                if(!configurated) {
                    $state.go('app.main');
                    return false;
                }
                return true;
            },
            set: function(bool) {
                configurated = bool;
            }
        }
    }
    $scope.configurated  = isConfigurated();

    /**
    * Define de Loading style and methods
    */
    function setLoading() {
        return {
            show : function (message) {
                $ionicLoading.show({
                  template: '<div><ion-spinner style="float:left"></ion-spinner><div style="float:left; margin-left:10px;margin-top:5px">'+message+'</span></div>'
                });
            },
            hide : function () {
                $ionicLoading.hide();
            }
        }
    }
    $scope.loading = setLoading();
    
    $scope.toast = {
        showTop: function(message) {
            $ionicPlatform.ready(function(){
                try
                {
                    $cordovaToast.showShortTop(message);
                }catch(err) {
                    console.log(err);                
                    alert(message);
                };
            });
        },
        showBottom: function(message) {
            $ionicPlatform.ready(function(){
                try
                {
                    $cordovaToast.showShortBottom(message);
                }catch(err) {
                    console.log(err);                
                    alert(message);
                };
            });
        }
    }
    
    /**
    *   Define the pop over structure and methods
    */
    function setPopover(){
        var popover;
        return {
            show: function(evento, optionCollection) {
                if(popover !== undefined) {
                    popover.remove();
                }
                $scope.optionCollection = optionCollection;
                $ionicPopover.fromTemplateUrl('templates/popover-options.html', {
                    scope: $scope
                }).then(function(p) {
                    popover = p;
                    popover.show(evento);
                });
            },
            hide: function() {
                popover.hide();
                popover.remove();
            }
        }
    }
    $scope.popover = setPopover();
    
    
    function setPopup() {
        return {
            show: function show(options) {
                $ionicPopup.show(options);
            }
        }
    }
    $scope.popup = setPopup();
    
    /**
    * Define the edit structure and methods
    */
    function setEditModal() {
        var editModal;
        return {
            show: function(template, scope) {
                $ionicModal.fromTemplateUrl(template, {
                    scope: scope
                }).then(function(modal) {
                    editModal = modal;
                    editModal.show();
                });
            },
            hide: function() {
                editModal.hide();
                editModal.remove();
            }
        }
    }
    $scope.editModal = setEditModal();

    function setUser() {
        var user = {name : 'guest'};
        return {
            get: function get() {
                return user.metadata;
            },

            id: function id() {
              return user.name;  
            },

            set: function set(newUser) {
                user = newUser;
                if(newUser !== undefined && newUser != null) {
                    $scope.databaseService.syncronize(user.name, function(info) {
                        $scope.$broadcast('update', info);
                    });
                } else {
                    user = {name : 'guest'};
                    $scope.databaseService.syncronize(null, 'cancel');
                    $scope.$broadcast('update');
                }
            },

            isLoggedIn: function isLoggedIn() {
                return (user.metadata !== undefined && user.metadata != null);
            }
        }
    }
    $scope.user = setUser();

    
    /**
    * Hide the superior bar when scrolled down and show the superior bar when scrolled up
    */
    function setHideNavBar() {
        var positionTopBefore = 0;
        $scope.isHideNavBar = false;
        return function(handleScroll){
            var position = $ionicScrollDelegate.$getByHandle(handleScroll).getScrollPosition();
            if(position.top - positionTopBefore > 50) {
                positionTopBefore = position.top;
                $scope.isHideNavBar = true;
                $scope.$apply();
            }
            else if(position.top - positionTopBefore < -10) {
                positionTopBefore = position.top;
                $scope.isHideNavBar = false;
                $scope.$apply();
            }
        }
    }
    $scope.hideNavBar = setHideNavBar();

    /**
    *   Show the login modal
    */
    $scope.showLogin = function() {
        $scope.data = {};
        var options = {
                templateUrl: 'templates/login.html',
                title: $scope.translation.LOGIN_LABEL,
                scope: $scope,
                buttons: [
                  { text: $scope.translation.CANCEL_LABEL, },
                  {
                    text: '<b>'+$scope.translation.LOGIN_LABEL+'</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if($scope.data.user == '' || $scope.data.password == '') {
                            e.preventDefault();
                            $scope.toast.showBottom($scope.translation.FIELDS_REQUIRED);
                        } else {
                            $scope.loading.show($scope.translation.LOGING + ' ...');

                            $scope.databaseService.user.login($scope.data.user, $scope.data.password).then(function(user) {
                                $scope.user.set(user);
                                $scope.loading.hide();
                            }).catch(function(err) {
                                console.log(err);
                                var message = $scope.translation.ERROR_INVALID_USERNAME_PASSWORD;
                                if (err.name === 'not_found') {
                                  message = $scope.translation.ERROR_LOGIN_USER_NOT_FOUND;
                                }
                                $scope.loading.hide();
                                $scope.toast.showBottom(message);
                            });
                            return {'ok': true};
                        }
                    }
                  }
                ]
            }
        $scope.popup.show(options);
    }

    /**
    *   Logout the user
    */
    $scope.logout = function() {
        $scope.loading.show($scope.translation.LOGOUTING + ' ...');
            
        $scope.databaseService.user.logout().then(function(){
            $scope.user.set();
            $scope.loading.hide();
        }).catch(function(err) {
            console.log(err);
            $scope.loading.hide();
            $scope.toast.showBottom($scope.translation.ERROR_LOGOUT);
        });
    }
})

.controller('MainCtrl', function ($scope, $state, $ionicHistory, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(false);
    /**
    *   Execute after start function
    */
    function startComplete() {
        if(navigator.splashscreen !== undefined) {
            navigator.splashscreen.hide();
        }
        $ionicHistory.nextViewOptions({
            historyRoot: true
        });
        $ionicSideMenuDelegate.canDragContent(true);
        $scope.configurated.set(true);
        $state.go('app.list');
    }

    /**
    *   Execute after the configuration 
    */
    function onStart() {
        $scope.databaseService.user.getLogged().then(function(user) {
            if(user) {
                $scope.user.set(user);
            }
            startComplete();
        }).catch(function(err) {
            if(err.name == 'not_logged') {
                $scope.databaseService.user.getStored().then(function(user) {
                    if(user) {
                        $scope.user.set(user);
                    }
                    startComplete(); 
                }).catch(function(err) {
                    if(err.name != 'not_stored' && !(err.name == 'not_found' && err.reason == 'deleted') ) {
                        $scope.toast.showBottom($scope.translation.ERROR_FIND_LOGIN_USER);    
                    }
                    startComplete(); 
                });   
            } else {
                console.log(err);
                if(err.name == 'login_error') {
                    $scope.toast.showBottom($scope.translation.ERROR_LOGGED_USER_NOT_FOUND);
                }
                startComplete(); 
            }
            
        });
    }

    $scope.databaseService.configure().then(function (doc) {
      onStart();
    }).catch(function(err) {
      console.log(err);
      onStart();
    });
})

.controller('ListCtrl', function($scope, $filter, $ionicModal, $location, ListService) {
    
    $scope.query = {};
    $scope.hasSearch = false;
    $scope.list;
    $scope.listCollection = [];
    $scope.listService;
        
        
    /**
    *   Execute after the controller is loaded 
    */
    function onStart() {
        if ($location.path() != '/app/list' || !$scope.configurated.get()) return;
        
        $scope.loading.show($scope.translation.LOADING_LISTS + ' ...');

        $scope.listService = ListService($scope.user.id(), $scope.databaseService);
        $scope.listService.list().then(function (list) {
            $scope.listCollection = list;
            $scope.loading.hide();
        }).catch(function (mensage) {
            $scope.toast.showBottom(mensage);
            $scope.loading.hide();
        });
    }
    
    /**
    *   Show or hide the search bar
    */
    $scope.showSearch = function(show) {
        $scope.hasSearch = show;
    }

    /**
    *   Close the modal
    */
    $scope.oldData;
    $scope.closeModal = function() {
        if ($scope.oldData !== undefined)
        {
            angular.copy($scope.oldData, $scope.list);
            $scope.oldData = null;
        }
        $scope.editModal.hide();
    };

    /**
    *   Show the edit form and manager the old data
    */  
    function edit(id) {
        $scope.list =  $filter('getById')($scope.listCollection, id);
        $scope.oldData = angular.copy($scope.list);
        $scope.editModal.show('templates/editList.html', $scope);
        $scope.popover.hide();
    }
    /**
    *   Exclude a list and update the list collection
    */
    function exclude(id) {
        var list =  $filter('getById')($scope.listCollection, id);
        if(!confirm($scope.translation.CONFIRM_DELETING_LIST.replace('LIST_NAME', list.name))) {
            return;
        }
        $scope.popover.hide();
        var indexOf = $scope.listCollection.indexOf(list);
        $scope.listService.remove(list._id).then(function (result) {
            if (result) {
                $scope.listCollection.splice(indexOf, 1);
                $scope.toast.showBottom($scope.translation.DELETED_LIST.replace('LIST_NAME', list.name));
            }
        }).catch(function (err) {
            var message;
            if(err.name === 'invalid_list') {
                message = $scope.translation.ERROR_INVALID_LIST;
            } else if(err.name === 'inform_list_id') {
                message = $scope.translation.ERROR_LIST_ID_REQUIRED;
            } else {
                message = $scope.translation.ERROR_DELETE_LIST.replace('LIST_NAME', list.name);
                console.log(err);
            }

            $scope.toast.showBottom(message);
        });
        
    }

    /**
    *   Save the list data in the list Collection
    */
    $scope.doSave = function() {
        if($scope.list._id == 0) {
                $scope.list.user = $scope.user.id();
        }
        return $scope.listService.save($scope.list).then(function (newList) {
            var list = $filter('getById')($scope.listCollection, newList._id);
            if (list != null) {
                var index = $scope.listCollection.indexOf(list);
                $scope.listCollection.splice(index, 1);
            } 
            $scope.listCollection.push(newList);
            $scope.toast.showBottom($scope.translation.LIST_SAVE_SUCCESSFUL);
            $scope.editModal.hide();
            $scope.list = null;
        }).catch(function (err){
            var message;
            if(err.name === 'invalid_list') {
                message = $scope.translation.ERROR_INVALID_LIST;
            } else if(err.name === 'list_name') {
                message = $scope.translation.ERROR_LIST_NAME_REQUIRED;
            } else if(err.name === 'duplicated_list') {
                message = $scope.translation.ERROR_DUPLICATED_LIST;
            } else {
                message = $scope.translation.ERROR_SAVE_LIST;
                console.log(err);
            }

            $scope.toast.showBottom(message);
        });
    }


    function sync(id) {
        $scope.list =  $filter('getById')($scope.listCollection, id);
        $scope.list.user = $scope.user.id();
        $scope.listService.save($scope.list).then(function(ok) {
            if(ok) {
                $scope.popover.hide();
                $scope.toast.showBottom($scope.translation.LIST_SYNC_SUCCESSFUL);  
            }
        }).catch(function (err){
            console.log(err);
            
            $scope.toast.showBottom($scope.translation.LIST_SYNC_FAIL);
        });

    }
    
    /**
    *   Show the add form 
    */
    $scope.add = function() {
        $scope.list = {_id: 0, name: '', productsTotal: 0};
        $scope.editModal.show('templates/editList.html', $scope);
    }

    $scope.isGuest = function(list) {
        return (list.user == 'guest')
    }
    
    /**
    *   Defime the options that will be showed for each list
    */
    $scope.openOptions = function($event, id, isSync) {
        $event.preventDefault();
        $event.stopPropagation();
        var optionCollection = [{name: $scope.translation.EDIT_LABEL, action: function() {edit(id)}, classe: '', icon: {left:'icon-left ion-compose'}},
                              {name: $scope.translation.DELETE_LABEL, action: function(){ exclude(id)}, classe: '', icon: {left:'icon-left ion-trash-a'}}];
        if(isSync && $scope.user.isLoggedIn()) {
            optionCollection.push({name: $scope.translation.SYNC_LABEL, action: function(){ sync(id)}, classe: '', icon: {left:'icon-left ion-loop'}})
        }

        $scope.popover.show($event, optionCollection);
    };

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        if ($location.path() == '/app/list') {
            onStart();
        }

    });

    $scope.$on('update', function(info) {
            onStart();
    });
})

.controller('productListCtrl', function($scope, $timeout, $state, $filter, $ionicScrollDelegate, $location, ProductService, MeasureService) {
    $scope.query = '';  
    $scope.order = 'name';
    $scope.revert = false;
    $scope.hideChecked = false;
    $scope.optionCollection = [];
    $scope.hasSearch = false;
    $scope.productCollection = [];
    $scope.productsTotal = 0;
    $scope.priceTotal = 0;
    $scope.product = {};
    $scope.measureCollection = MeasureService().all();
    $scope.productService;

    
   function onStart() {
        if ($location.path().indexOf('/app/list/') == -1 || !$scope.configurated.get()) return;

        if($state.params.id === undefined || ($state.params.id !== undefined && $state.params.id < 1)) {
            $scope.toast.showBottom($scope.translation.INVALID_LIST);
            $state.go('app.list');
            return;
        }

        $scope.loading.show($scope.translation.LOADING_PRODUCTS + ' ...');

        $scope.productService = ProductService($state.params.id, $scope.databaseService);
        $scope.productService.list().then(function (list) {
            $scope.productCollection = list;
            updateProductsTotal();
            updatePriceTotal();
            $scope.loading.hide();
        }).catch(function (mensage){
            $scope.toast.showBottom(mensage);
        });
    }
    
    function updateProductsTotal() {
        $scope.productsTotal = 0;
        if($scope.productCollection !== undefined && $scope.productCollection.length > 0) {
            $scope.productsTotal = $scope.productCollection.length;
        }
    }
    
    function updatePriceTotal() {
        var price = 0;
        if($scope.productCollection !== undefined && $scope.productCollection.length > 0) {
            angular.forEach($scope.productCollection, function(value, key) {
                price += (value.unit * value.price);
            });
        }
        
        $scope.priceTotal = price;
    }
   
    $scope.oldData;
    $scope.closeModal = function() {
        if ($scope.oldData !== undefined)
        {
            angular.copy($scope.oldData, $scope.product);
            $scope.oldData = null;
        }
        $scope.editModal.hide();
    };

    function edit(id) {
        $scope.product =  $filter('getById')($scope.productCollection, id);
        $scope.oldData = angular.copy($scope.product);
        $scope.editModal.show('templates/editProduct.html', $scope);
        $scope.popover.hide();
    }

    function save() {
        $scope.product.oldName = $scope.oldData.name;
        return $scope.productService.save($scope.product).then(function (newProduct) {
            var product = $filter('getById')($scope.productCollection, newProduct._id);
            if (product != null) {
                var index = $scope.productCollection.indexOf(product);
                $scope.productCollection.splice(index, 1);
            }
            $scope.oldData = null;
            $scope.product = null;
            $scope.productCollection.push(newProduct);

            updateProductsTotal();
            updatePriceTotal();
        }, function (err) {
            var message;
            if(err.name === 'invalid_product') {
                message = $scope.translation.ERROR_INVALID_PRODUCT;
            } else if(err.name === 'product_name') {
                message = $scope.translation.ERROR_PRODUCT_NAME_REQUIRED;
            } else if(err.name === 'duplicated_product') {
                message = $scope.translation.ERROR_DUPLICATED_PRODUCT;
            } else {
                message = $scope.translation.ERROR_SAVE_PRODUCT;
                console.log(err);
            }

            $scope.toast.showBottom(message);
        });
    }
    
    function exclude(id) {
        var product =  $filter('getById')($scope.productCollection, id);
        if(!confirm($scope.translation.CONFIRM_DELETING_PRODUCT.replace('PRODUCT_NAME', product.name))) {
            return;
        }
        $scope.popover.hide();

        $scope.productService.remove(product.name).then(function () {
            var indexOf = $scope.productCollection.indexOf(product);
            $scope.productCollection.splice(indexOf, 1);
            $scope.toast.showBottom($scope.translation.DELETED_PRODUCT.replace('PRODUCT_NAME', product.name));
            updateProductsTotal();
            updatePriceTotal();
        }).catch(function(err){
            var message;
            if(err.name === 'invalid_product') {
                message = $scope.translation.ERROR_INVALID_PRODUCT;
            } else if(err.name === 'inform_product_id') {
                message = $scope.translation.ERROR_PRODUCT_ID_REQUIRED;
            } else {
                message = $scope.translation.ERROR_DELETE_PRODUCT.replace('PRODUCT_NAME', product.name);
                console.log(err);
            }
        });
        
    }

     
    $scope.add = function() {
        $scope.product = {_id: $scope.productCollection.length, name: '', price: '', unit: '', amount: '', measure: '', checked: false};
        $scope.oldData = {name : ''};
        $scope.editModal.show('templates/editProduct.html', $scope);
    }
    
    $scope.save = function () {
        save().then(function () {
            $scope.editModal.hide();
        });
    }
    
    $scope.showSearch = function(show) {
        $scope.hasSearch = show;
    }
    
    function order(order) {
        if($scope.order != order) {
            $scope.order = order;
            $scope.revert = false;
        }
        else {
            $scope.revert = !$scope.revert;
        }
        $scope.popover.hide();
    }

    function verifyOrder(order) {
        if($scope.order == order) {
            if($scope.revert) {return 'fa fa-sort-amount-desc';} else {return 'fa fa-sort-amount-asc';}
        }
        return '';
    }
  
    $scope.openOrder = function($event) {
        var optionCollection = [{name: $scope.translation.NAME_LABEL, action: function() {order('name')}, classe: '', icon: {right: verifyOrder('name')}},
                              {name: $scope.translation.PRICE_LABEL, action: function() {order('price')}, classe: '', icon: {right: verifyOrder('price')}},
                              {name: $scope.translation.AMOUNT_LABEL, action: function() {order('amount')}, icon: {right: verifyOrder('amount')}}];
        $scope.popover.show($event, optionCollection);
    };
  
    $scope.openOptions = function($event, id) {
        var optionCollection = [{name: $scope.translation.EDIT_LABEL, action: function() {edit(id)}, classe: '', icon: {left:'icon-left ion-compose'}},
                              {name: $scope.translation.DELETE_LABEL, action: function(){ exclude(id)}, classe: '', icon: {left:'icon-left ion-trash-a'}}];
            
        $scope.popover.show($event, optionCollection);
    };

    $scope.toogleChecked = function() {
        $scope.hideChecked = !$scope.hideChecked;
    }
 
    $scope.check = function (id) {

        $scope.product = $filter('getById')($scope.productCollection, id);
        $scope.oldData = {name : $scope.product.name};
        save();
        var position = $ionicScrollDelegate.$getByHandle('listProductsScroll').getScrollPosition();
        $ionicScrollDelegate.scrollTo(position.left, position.top, false);
    }

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        onStart();

    });

    $scope.$on('update', function() {
        onStart();

    })
})

.controller('compareProductsCtrl', function($scope) {
});
