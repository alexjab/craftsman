'use strict';

var _ = require ('lodash');

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
        return _.some (val, satisfies);
        case '$and':
        return _.every (val, satisfies);
        case '$not':
        return !satisfies (val);
        default:
        return that._rules[key].call (that, data, val);
      };
    });
  };

  return satisfies (this._pattern);
};

module.exports = Craftsman;
