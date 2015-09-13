'use strict';

var should = require ('should');

var craftsman = require ('../index.js');

var _some = craftsman._some;
var _every = craftsman._every;

describe ('craftsman - A javascript specification pattern engine', function () {

  describe ('_some', function () {
    it ('should return true (the iterator always returns true)', function () {
      try {
        _some (['foo', 'bar', 'baz'], function () {
          return true;
        });
      } catch (e) {
        should.not.exist (e);
      }
    });

    it ('should return true (the iterator returns true at least once)', function () {
      try {
        _some (['foo', 'bar', 'baz'], function (string, i) {
          if (i % 2) return true;
          throw new Error ('Foo is not bar');
        });
      } catch (e) {
        should.not.exist (e);
      }
    });

    it ('should throw an error (the iterator never returns true)', function () {
      try {
        _some (['foo', 'bar', 'baz'], function (string) {
          throw new Error (string + ' is not pif');
        });
      } catch (e) {
        should.exist (e);
        e.message.should.equal ('baz is not pif');
      }
    });
  });

  describe ('_every', function () {
    it ('should return true (the iterator always returns true)', function () {
      try {
        _every (['foo', 'bar', 'baz'], function () {
          return true;
        });
      } catch (e) {
        should.not.exist (e);
      }
    });

    it ('should throw an error (the iterator throws at least one error)', function () {
      try {
        _every (['foo', 'bar', 'baz'], function (string) {
          throw new Error (string + ' is not pif');
        });
      } catch (e) {
        should.exist (e);
        e.message.should.equal ('foo is not pif');
      }
    });
  });

  describe ('#pattern ()', function () {
    var pattern = { foo: 'bar' };
    var spec = new craftsman ();
    var actual = spec.pattern (pattern);

    it ('should set the specification pattern', function () {
      spec._pattern.should.eql (pattern);
    });

    it ('should return the instance', function () {
      actual.should.eql (spec);
    });
  });

  describe ('#rule ()', function () {
    var ruleKey = 'foo';
    var validator = { bar: 'baz' };
    var spec = new craftsman ();
    var actual = spec.rule (ruleKey, validator);

    it ('should set the validator for the rule "foo"', function () {
      spec._rules[ruleKey].should.eql (validator);
    });

    it ('should return the instance', function () {
      actual.should.eql (spec);
    });
  });

  describe ('#isSatisfiedBy', function () {
    describe ('$or case', function () {
      it ('should call only one rule method (no exception)', function () {
        var spec = new craftsman ();
        var fooCalled = false, barCalled = false, bazCalled = false;

        spec.pattern ({
          '$or': [
            { foo: 'foo' },
            { bar: 'bar' },
            { baz: 'baz' }
          ]
        }).rule ('foo', function () {
          fooCalled = true;
          return true;
        }).rule ('bar', function () {
          barCalled = true;
          return true;
        }).rule ('baz', function () {
          bazCalled = true;
          return true;
        });

        spec.isSatisfiedBy ({});

        fooCalled.should.be.true ();
        barCalled.should.be.false ();
        bazCalled.should.be.false ();
      });

      it ('should call all rule methods (with some exceptions)', function () {
        var spec = new craftsman ();
        var fooCalled = false, barCalled = false, bazCalled = false;

        spec.pattern ({
          '$or': [
            { foo: 'foo' },
            { bar: 'bar' },
            { baz: 'baz' }
          ]
        }).rule ('foo', function () {
          fooCalled = true;
          throw new Error ('bar');
        }).rule ('bar', function () {
          barCalled = true;
          throw new Error ('baz');
        }).rule ('baz', function () {
          bazCalled = true;
          return true;
        });

        spec.isSatisfiedBy ({});

        fooCalled.should.be.true ();
        barCalled.should.be.true ();
        bazCalled.should.be.true ();
      });

      it ('should raise an exception (with exceptions only)', function () {
        var spec = new craftsman ();
        var fooCalled = false, barCalled = false, bazCalled = false;

        spec.pattern ({
          '$or': [
            { foo: 'foo' },
            { bar: 'bar' },
            { baz: 'baz' }
          ]
        }).rule ('foo', function () {
          fooCalled = true;
          throw new Error ('foo');
        }).rule ('bar', function () {
          barCalled = true;
          throw new Error ('bar');
        }).rule ('baz', function () {
          bazCalled = true;
          throw new Error ('baz');
        });

        var err;
        try {
          spec.isSatisfiedBy ({});
        } catch (e) {
          err = e;
        }

        should.exist (err);
        err.message.should.equal ('baz');

        fooCalled.should.be.true ();
        barCalled.should.be.true ();
        bazCalled.should.be.true ();
      });
    });

    describe ('$and case', function () {
      it ('should call all rule methods (no exception)', function () {
        var spec = new craftsman ();
        var fooCalled = false, barCalled = false, bazCalled = false;

        spec.pattern ({
          '$and': [
            { foo: 'foo' },
            { bar: 'bar' },
            { baz: 'baz' }
          ]
        }).rule ('foo', function () {
          fooCalled = true;
          return true;
        }).rule ('bar', function () {
          barCalled = true;
          return true;
        }).rule ('baz', function () {
          bazCalled = true;
          return true;
        });

        spec.isSatisfiedBy ({});

        fooCalled.should.be.true ();
        barCalled.should.be.true ();
        bazCalled.should.be.true ();
      });

      it ('should call the first rule method (with exceptions)', function () {
        var spec = new craftsman ();
        var fooCalled = false, barCalled = false, bazCalled = false;

        spec.pattern ({
          '$and': [
            { foo: 'foo' },
            { bar: 'bar' },
            { baz: 'baz' }
          ]
        }).rule ('foo', function () {
          fooCalled = true;
          throw new Error ('foo');
        }).rule ('bar', function () {
          barCalled = true;
          throw new Error ('bar');
        }).rule ('baz', function () {
          bazCalled = true;
          throw new Error ('baz');
        });

        var err;
        try {
          spec.isSatisfiedBy ({});
        } catch (e) {
          err = e;
        }

        should.exist (err);
        err.message.should.equal ('foo');

        fooCalled.should.be.true ();
        barCalled.should.be.false ();
        bazCalled.should.be.false ();
      });
    });

    describe ('leaf rule', function () {
      it ('should call the method associated with the leaf rule', function () {
        var spec = new craftsman ();
        var fooCalled = false;

        spec.pattern ({
          'foo': {
            bar: 'bar',
            baz: 'baz'
          }
        }).rule ('foo', function () {
          fooCalled = true;
          return true;
        });

        spec.isSatisfiedBy ({});

        fooCalled.should.be.true ();
      });
    });
  });
});
