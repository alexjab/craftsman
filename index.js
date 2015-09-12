'use strict';

var _ = require ('lodash');

var _some = function (arr, fun) {
  var lastErr, lastCall;

  var length = arr.length;
  for (var i = 0; i < length; i++) {
    try {
      lastCall = fun (arr[i]);
      if (lastCall) return lastCall;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr;
};

var _every = function (arr, fun) {
  var length = arr.length;
  for (var i = 0; i < length; i++) {
    fun (arr[i]);
  }

  return true;
};

var Craftsman = function () {
  this._pattern = null;
  this._rules = {};

  return this;
};

Craftsman.prototype.pattern = function (pattern) {
  this._pattern = pattern;
  return this;
};

Craftsman.prototype.rule = function (ruleKey, validator) {
  this._rules[ruleKey] = validator;
  return this;
};

Craftsman.prototype.satisfies = function (data) {
  var that = this;
  var satisfies = function (rules) {
    return _.every (rules, function (val, key) {
      switch (key) {
        case '$or':
        return _some (val, satisfies);
        case '$and':
        return _every (val, satisfies);
        default:
        return that._rules[key].call (that, data, val);
      };
    });
  };

  return satisfies (this._pattern);
};

module.exports = Craftsman;
