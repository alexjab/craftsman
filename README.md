# craftsman
A javascript specification pattern engine, designed to try your data against a set of rules.

## TL;DR:
```
'use strict';

// Imports and shit
var craftsman = require ('craftsman');
var apple = new craftsman ();

// Define your pattern against your data will be tried
apple.pattern ({
  '$and': [
    {
      '$or': [
        { 'color': 'green' },
        { 'color': 'red' }
      ]
    },
    { 'shape': 'round' },
    { 'size': 'medium' }
  ]
});

// Define your custom rules
apple.rule ('color', function (data, rule) {
  if (data.color === rule) return true;
  throw new Error ('The color must be ' + rule);
});

apple.rule ('shape', function (data, rule) {
  if (data.shape === rule) return true;
  throw new Error ('The shape must be ' + rule);
});

apple.rule ('size', function (data, rule) {
  if (data.size === rule) return true;
  throw new Error ('The size must be ' + rule);
});

// Try your data against your pattern
apple.isSatisfiedBy ({ color: 'red', shape: 'round', size: 'medium' });
// => returns true

apple.isSatisfiedBy ({ color: 'orange', shape: 'round', size: 'medium' });
// => throws an error
```
