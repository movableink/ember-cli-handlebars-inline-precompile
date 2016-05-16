var assert = require('assert');

var babel = require('babel-core');
var HandlebarsInlinePrecompile = require('../lib/handlebars-inline-precompile-plugin');

var transform;

function FakeJavaScriptCompiler() {}
FakeJavaScriptCompiler.prototype.nameLookup = function () {};

describe("handlebars-inline-precompile", function() {
  beforeEach(function() {
    transform = function(code, precompile) {
      return babel.transform(code, {
        blacklist: ['strict', 'es6.modules'],
        plugins: [HandlebarsInlinePrecompile({
          precompile: precompile,
          JavaScriptCompiler: FakeJavaScriptCompiler
        })]
      }).code;
    }
  });

  it("adds necessary modules to run the template", function() {
    var transformed = transform("import hbs from 'handlebars-inline-precompile';");

    assert.equal(transformed, "import _handlebarsRuntime from 'handlebars.runtime';\nimport _emberMetalGet from 'ember-metal/get';");
  });

  it("throws error when import statement is not using default specifier", function() {
    try {
      transform("import { hbs } from 'handlebars-inline-precompile'");

      assert.fail("error should have been thrown");
    } catch (e) {
      assert.ok(e.message.match(/Only `import hbs from 'handlebars-inline-precompile'` is supported/), "needed import syntax is present");
      assert.ok(e.message.match(/You used: `import { hbs } from 'handlebars-inline-precompile'`/), "used import syntax is present");
    }
  });


  it("replaces tagged template expressions with precompiled version", function() {
    var transformed = transform("import hbs from 'handlebars-inline-precompile'; var compiled = hbs`hello`;", function(template) {
      return "precompiled(" + template + ")";
    });

    assert.equal(transformed, "import _handlebarsRuntime from 'handlebars.runtime';\nimport _emberMetalGet from 'ember-metal/get';\nvar compiled = _handlebarsRuntime.template(precompiled(hello));", "tagged template is replaced");
  });


  it("warns when the tagged template string contains placeholders", function() {
    assert.throws(function() {
      transform("import hbs from 'handlebars-inline-precompile'; var compiled = hbs`string ${value}`");
    }, /placeholders inside a tagged template string are not supported/);
  });

  describe('single string argument', function() {
    it("works with a plain string as parameter hbs('string')", function() {
      var transformed = transform("import hbs from 'handlebars-inline-precompile'; var compiled = hbs('hello');", function(template) {
        return "precompiled(" + template + ")";
      });

      assert.equal(transformed, "import _handlebarsRuntime from 'handlebars.runtime';\nimport _emberMetalGet from 'ember-metal/get';\nvar compiled = _handlebarsRuntime.template(precompiled(hello));", "tagged template is replaced");
    });

    it("warns when more than one argument is passed", function() {
      assert.throws(function() {
        transform("import hbs from 'handlebars-inline-precompile'; var compiled = hbs('first', 'second');");
      }, /hbs should be invoked with a single argument: the template string/);
    });

    it("warns when argument is not a string", function() {
      assert.throws(function() {
        transform("import hbs from 'handlebars-inline-precompile'; var compiled = hbs(123);");
      }, /hbs should be invoked with a single argument: the template string/);
    });

  });
});
