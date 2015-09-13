'use strict';

var craftsman = require ('./index.js');

var spec = new craftsman ();

spec.pattern ({
  '$and': [
    {
      '$or': [
        {
          'date': {
            'from': new Date (2015, 1, 1, 0, 0, 0),
            'until': new Date (2015, 1, 31, 23, 59, 59),
          }
        },
        {
          'price': {
            'above': 10,
            'below': 20
          }
        }
      ]
    }, {
      'nb_items': {
        'moreThan': 7
      }
    }
  ]
});

spec.rule ('date', function (data, rule) {
  if (data.buyDate > rule.from && data.buyDate < rule.until) {
    return true;
  }
  throw new Error ('Date is outside the bounds');
});

spec.rule ('price', function (data, rule) {
  if (data.priceOfThingy > rule.above && data.priceOfThingy < rule.below) {
    return true;
  }
  throw new Error ('The price is wrong');
});

spec.rule ('nb_items', function (data, rule) {
  if (data.itemsInBox > rule.moreThan) {
    return true;
  }
  throw new Error ('The number of items is wrong');
});

var err;
try {
  spec.isSatisfiedBy ({
    'buyDate': new Date (2014, 1, 15),
    'priceOfThingy': 15,
    'itemsInBox': 10
  });
} catch (e) {
  err = e;
}

if (err) return console.log ('Does not satisfy the rules:', err.message);
console.log ('Satisfies the rules !');
