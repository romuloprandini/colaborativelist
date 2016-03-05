var myModule = angular.module('carrinhofacil.services', [])
.factory('MedidaService', function() {
    function getListaMedidas() {
        return [{id:"U", nome:"Unidades"},
                {id:"Ml", nome:"Mililítros"},
                {id:"L", nome:"Litros"},
                {id:"G", nome:"Gramas"},
                {id:"Kg", nome:"Kilogramas"}];
    }
  return {
      getListaMedidas: getListaMedidas
  };
})
.factory('ListaService', ['$q', '$timeout', function($q, $timeout){
    
    var lista =  [
                { id: 1,  nome: 'lista Compras 1'},
                { id: 2,  nome: 'lista Compras 2'},
                { id: 3,  nome: 'lista Compras 3'},
                { id: 4,  nome: 'lista Compras 4'},
                { id: 5,  nome: 'lista Compras 5'},
                { id: 6,  nome: 'lista Compras 6'},
                { id: 7,  nome: 'lista Compras 7'}
            ];
    function getListas() {
        var deferred = $q.defer();
        
        $timeout(function() {
            deferred.resolve(lista);
        }, 2000);
        
        return deferred.promise;
    }
    
    function save(novo) {
        var deferred = $q.defer();
        
        if(novo !== undefined && novo.nome === undefined ) {
            deferred.reject("Informe o nome da lista!");
        }
        else if(novo === undefined) {
            deferred.reject("Lista inválida!");
        }
        else {
            angular.forEach(lista, function(value, key) {
                if(value.id !== novo.id && value.nome.toLowerCase() == novo.nome.toLowerCase()) {
                    deferred.reject("Já existe uma lista com esse nome!");
                    return;
                }
            });
            
            if(novo.id < 1) {
                novo.id = lista.length;
                lista.push(novo);
            } 
            else {
                angular.forEach(lista, function(value, key) {
                    if(value.id == novo.id) {
                        value.nome = novo.nome;
                        return;
                    }
                });
            }
            deferred.resolve(novo.id);
        }
        
        return deferred.promise;
    }
    
    return {
        getListas: getListas,
        save: save
    }
}])
.factory('ProdutoService', ['$q', '$filter', '$timeout', function($q, $filter, $timeout) {
    var lista = [{ id: 1,  listaId: 1, nome: 'Produto 1', checked: false, unidade: 5, preco: 5.99, quantidade: 500, medida: 'Ml' },
                    { id: 2,  listaId: 1, nome: 'Produto 2', checked: false, unidade: 3, preco: 4.70, quantidade: 1, medida: 'L' },
                    { id: 3,  listaId: 2, nome: 'Produto 3', checked: true, unidade: 10, preco: 14.90, quantidade: 300, medida: 'G' },
                    { id: 4,  listaId: 2, nome: 'Produto 4', checked: true, unidade: 1, preco: 99.10, quantidade: 0, medida: ''},
                    { id: 5,  listaId: 3, nome: 'Produto 5', checked: true, unidade: 10, preco: 2.89, quantidade: 150, medida: 'Ml' },
                    { id: 6,  listaId: 1, nome: 'Produto 6', checked: true, unidade: 3, preco: 5.99, quantidade: 500, medida: 'Ml' },
                    { id: 7,  listaId: 4, nome: 'Produto 7', checked: false, unidade: 99, preco: 15000.99, quantidade: 15, medida: 'Kg' },
                    { id: 8,  listaId: 5, nome: 'Produto 8', checked: true, unidade: 1, preco: 7.99, quantidade: 0, medida: '' },
                    { id: 9,  listaId: 2, nome: 'Produto 9', checked: false, unidade: 5, preco: 5.99, quantidade: 500, medida: 'Ml' },
                    { id: 10,  listaId: 5, nome: 'Produto 10', checked: false, unidade: 5, preco: 5.99, quantidade: 500, medida: 'Ml' },
                    { id: 11,  listaId: 3, nome: 'Produto 11', checked: false, unidade: 5, preco: 5.99, quantidade: 500, medida: 'Ml' }
                ];
    function getListaProdutos(listaId) {
        var deferred = $q.defer();
        if(listaId === undefined || (listaId !== undefined && listaId < 1)) {
            deferred.reject("Lista inválida!");
            return;
        }
        $timeout(function() {
            deferred.resolve($filter('filter')(lista, {listaId: listaId}))
        }, 2000);
        
        return deferred.promise;
    }
    
    function save(novo) {
        var deferred = $q.defer();
        
        if(novo === undefined) {
            deferred.reject("Produto inválido!");
        } else if(novo.nome === undefined ) {
            deferred.reject("Informe o nome da produto!");
        }
        else {
            angular.forEach(lista, function(value, key) {
                if(value.id !== novo.id && value.nome.toLowerCase() == novo.nome.toLowerCase()) {
                    deferred.reject("Já existe um produto com esse nome!");
                }
            });
            
            if(novo.id < 1) {
                novo.id = lista.length;
                console.log(novo);
                lista.push(novo);
            } 
            else {
                angular.forEach(lista, function(value, key) {
                    if(value.id == novo.id) {
                        value.nome = novo.nome;
                        value.preco = novo.preco;
                        value.unidade = novo.unidade;
                        value.quantidade = novo.quantidade;
                        value.medida = novo.medida;
                        value.checked = novo.checked;
                        return;
                    }
                });
            }
            deferred.resolve(novo.id);
        }
        
        return deferred.promise;
    }
    
    function contaProdutos(listaId) {
        var total = 0;
        angular.forEach(lista, function(value, key) {
            if(value.listaId == listaId) {
                total++;
            }
        });
        return total
    }
    
    return {
        getListaProdutos: getListaProdutos,
        save: save,
        contaProdutos: contaProdutos
    }
}])

;