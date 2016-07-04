(function() {
    'use strict';
    
    angular
        .module('colaborativelist.data')
        .factory('productData', productData);
        
    productData.$inject = ['common', 'database'];
    function productData(common, database) { 
        var promise = common.$q.defer();  
            var service = {
            get: getProduct,
            list: listAllProducts,
            save: saveProduct,
            remove: removeProduct,
            ready: getReady
        }
        
        init();
        
        return service;
        
        //FUNCTIONS
        
        function init() {
            promise.resolve(database.createDesignDoc('view_product', {
                by_list_id: {
                    map: function (doc) {
                        if (doc.productList) {
                            var listProductName = [];
                            doc.productList.forEach(function (product) {
                                listProductName.push(product.name.toLowerCase());
                            });
                            emit(doc._id, listProductName);
                        }

                    }.toString(),
                    reduce: '_count'
                }
            }).then(function(doc) {
            console.log('Criou Design doc product', doc);
        }));
        }
        
        function getReady(){
            return promise.promise;
        }
        
        function setProductData(data) {
            var product;
            if(data !== undefined) {
                product = {
                    _id: data._id,
                    name: data.name,
                    price: 0,
                    amount: 0,
                    measure: 0,
                    unit: '',
                    checked: false
                };
                
                if(data.price !== undefined) {
                    product.price = data.price;
                }
                if(data.amount !== undefined) {
                    product.amount = data.amount;
                }
                if(data.measure !== undefined) {
                    product.measure = data.measure;
                }
                if(data.unit !== undefined) {
                    product.unit = data.unit;
                }
                if(data.checked !== undefined) {
                    product.checked = data.checked;
                }
            }
            
            return product;            
        }
        
        function listAllProducts(listId) {
            if (listId === undefined || listId == 0) {
                throwError(translation.LIST_ID_REQUIRED);
            }
            var productList = [],
            options = {key : listId, include_docs : true};
            return database.filter('view_product/by_list_id', options)
                .then(onSuccess)
                .catch(onError);
                
           function onSuccess(docs) {
                if(docs.rows.length > 0) {
                    docs.rows[0].doc.productList.forEach(function (product, index) {
                        if(product._deleted != true)
                        {
                            product._id = index;
                            productList.push(setProductData(product));
                        }
                    });
                }
                return productList;
            }
            
            function onError(err) {
                var message = translation.GET_PRODUCT_ERROR;
                if(err.name == '') {
                    message = translation.ERROR;
                }
                throwError(message, err);
            }
        }
        
        function getProduct(listId, name) {
                        
            return database.get(listId)
                .then(onSuccess)
                .catch(onError);
                
            function onSuccess(doc) {
                var product;
                doc.rows[0].productList.forEach(function (value, index) {
                    if (value.name == name) {
                        value._id = index;
                        product = setProductData(value);
                        return;
                    }
                });
                return product;
            }
            
            function onError(err) {
                var message = translation.GET_PRODUCT_ERROR;
                if(err.name == '') {
                    message = translation.ERROR;
                }
                throwError(message, err);
            }
        }
                 
        function saveProduct(listId, product, oldName) {
            if(product === undefined) {
                throwError(translation.INVALID_PRODUCT);
            } else if (product.name === undefined || product.name.trim() == '') {
                throwError(translation.PRODUCT_NAME_REQUIRED);
            }
            
            return database.get(listId)
                .then(onSuccess)
                .catch(onError);
           
            function onSuccess(list) {                
                var index = -1;
                list.productList.forEach(function (value, idx) {
                    if (value.name == product.oldName) {
                        index = idx;
                        return;
                    }
                });
                
                product = {
                    name: product.name, 
                    price: product.price,
                    amount: product.amount,
                    measure: product.measure,
                    unit: product.unit,
                    checked: product.checked
               };
                                        
                if(index < 0) {
                    list.productList.push(product);
                } else {
                    list.productList[index] = product;
                }
                
                return database.save(list)
                    .then(onSuccess);
                    
                function onSuccess(doc) {
                    return doc.ok;
                };
            }
            
            function onError(err) {
                var message = translation.SAVE_PRODUCT_ERROR;
                if(err.name == '') {
                    message = translation.ERROR;
                }
                throwError(message, err);
            }
        }
        
        function removeProduct(listId, key) {
            if (listId === undefined) {
                throwError(translation.LIST_ID_REQUIRED);
            }
            
            if (key === undefined || key < 1) {
                throwError(translation.INVALID_PRODUCT_ERROR);
            }
            
            return database.get(listId)
                .then(onGetList)
                .catch(onError);
            
            function onGetList(list) {
                list.productList[key]._deleted = true;
                
                return database.save(list)
                    .then(onSaveList);
                
                function onSaveList(doc) {
                    return doc.ok;
                };
            };
              
            function onError(err) {
                var message = translation.DELETE_PRODUCT_ERROR;
                if(err.name == '') {
                    message = translation.ERROR;
                }
                throwError(message, err);
            }
        }
        
        function throwError(message, cause) {
            throw {message: message, cause: cause} ;
        }
    }
})();