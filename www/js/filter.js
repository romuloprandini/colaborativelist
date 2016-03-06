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
.filter('formatMoney', function () {
    return function (value, sign, decimalSep, thousSep) {
        return accounting.formatMoney(value, sign+" ", 2, thousSep||",", decimalSep||".");
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
});