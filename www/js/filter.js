angular.module('carrinhofacil.filters', [])

.filter('getById', function() {
  return function(input, id) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (input[i]._id == id) {
        return input[i];
      }
    }
    return null;
  }
})
.filter('formatarDinheiro', function () {
    return function (value, decimalSep, thousSep) {
        return accounting.formatMoney(value, "R$  ", 2, thousSep||".", decimalSep||",");
    }
})
.filter('orderProducts', function () {
  // custom value function for sorting
  function myValueFunction(orderBy, productA, productB, revert) {
    var diference = 0;
    switch(orderBy) {
        case 'name':
            diference = productA.name.localeCompare(productB.name);
            break;
        case 'price':
            diference = parseFloat(productA.price) - parseFloat(productB.price);
            break;
        case 'amount':
            diference = parseFloat(productA.unit) - parseFloat(productB.unit);
            break;
    }
    if(revert) {
        return -1*diference;
    } else {
        return diference;
    }
  }

  return function (obj, orderBy, revert) {
    var array = [];
    if(obj === undefined) {
        return;
    }
    Object.keys(obj).forEach(function (key) {
      // inject key into each object so we can refer to it from the template
      obj[key].order = key;
      array.push(obj[key]);
    });
    // apply a custom sorting function
    array.sort(function (a, b) {
      return myValueFunction(orderBy, a, b, revert);
    });
    return array;
  };
})

.filter('filterProductCollection', ['$filter', function ($filter) {
    return function (obj, query) {
        if(obj === undefined) {
            return;
        }
        var filtered = $filter('filter')(obj, query);
        Object.keys(obj).forEach(function (key) {
          if(filtered.indexOf(obj[key]) < 0) {
            filtered.push(obj[key]);
          }
        });
        return filtered;
    }
}]);

/*.filter('orderProductsOld', function () {
  // custom value function for sorting
  function myValueFunction(tipoOrdenacao, productA, productB, revert) {
    var valorA = 0, valorB = 0;
    switch(tipoOrdenacao) {
        case 'nome':
            valorA = productA.nome;
            valorB = productB.nome;
            break;
        case 'preco':
            valorA = productA.preco;
            valorB = productB.preco;
            break;
        case 'quantidade':
            valorA = productA.unidade;
            valorB = productB.unidade;
            break;
    }
    
    if(productA.checked && !productB.checked) {
        return 1;
    }
    else if(!productA.checked && productB.checked) {
        return -1;
    }
    else if((productA.checked && productB.checked) || (!productA.checked && !productB.checked)) {
        if(productB.divider) {
            return 1;
        }
        if(valorA < valorB) {
            if(!revert) {
                return -1;
            }
            else {
                return 1;
            }
        }
        else if(valorA > valorB) {
            if(!revert) {
                return 1;
            }
            else {
                return -1;
            }
        }
        return 0
    }
  }

  return function (obj, tipoOrdenacao, revert) {
    var array = [];
    Object.keys(obj).forEach(function (key) {
      // inject key into each object so we can refer to it from the template
      obj[key].name = key;
      array.push(obj[key]);
    });
    // apply a custom sorting function
    array.sort(function (a, b) {
      return myValueFunction(tipoOrdenacao, a, b, revert);
    });
    return array;
  };
})*/