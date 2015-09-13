'use strict';

var _ = require ('lodash');

var Craftsman = function () {
  this._pattern = null;
  this._rules = {};

  return this;
};

// A `some` implementation with `throw new Error` instead of `return false`;
var _some = Craftsman._some = function (arr, fun) {
  var lastErr, lastCall;

  var length = arr.length;
  for (var i = 0; i < length; i++) {
    try {
      lastCall = fun.call (this, arr[i], i);
      if (lastCall) return lastCall;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr;
};

var _every = Craftsman._every = function (arr, fun) {
  var length = arr.length;
  for (var i = 0; i < length; i++) {
    fun.call (this, arr[i], i);
  }

  return true;
};

Craftsman.prototype.pattern = function (pattern) {
  this._pattern = pattern;
  return this;
};

Craftsman.prototype.rule = function (ruleKey, validator) {
  this._rules[ruleKey] = validator;
  return this;
};

Craftsman.prototype.isSatisfiedBy = function (data) {
  var that = this;
  var satisfied = function (rules) {
    return _.every (rules, function (val, key) {
      switch (key) {
        case '$or':
        return _some.call (that, val, satisfied);
        case '$and':
        return _every.call (that, val, satisfied);
        default:
        return that._rules[key].call (that, data, val);
      }
    });
  };

  return satisfied (this._pattern);
};

module.exports = Craftsman;
