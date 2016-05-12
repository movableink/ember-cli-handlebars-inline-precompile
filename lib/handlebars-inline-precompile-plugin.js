/* jshint node: true */
'use strict';

var HANDLEBARS = 'handlebars-inline-precompile';
var GET = 'ember-metal/get';

module.exports = function (Handlebars) {
  return function (babel) {
    var t = babel.types;

    var compile = function (node, template, hbs, get) {
      var nameLookup = Handlebars.JavaScriptCompiler.prototype.nameLookup;
      Handlebars.JavaScriptCompiler.prototype.nameLookup = function (parent, name, type) {
        if (type === 'context') {
          return [get, '(', parent, ', "', name, '")'];
        } else {
          return nameLookup.call(this, parent, name, type);
        }
      };

      var compiledTemplateString = hbs + '.template(' + Handlebars.precompile(template) + ', ' + hbs + ')';

      // Prefer calling replaceWithSourceString if it is present.
      // this prevents a deprecation warning in Babel 5.6.7+.
      //
      // TODO: delete the fallback once we only support babel >= 5.6.7.
      if (node.replaceWithSourceString) {
        node.replaceWithSourceString(compiledTemplateString);
      } else {
        return compiledTemplateString;
      }
    };

    return new babel.Transformer('handlebars-inline-precompile', {
      ImportDeclaration: function (node, parent, scope, file) {
        if (t.isLiteral(node.source, { value: 'handlebars-inline-precompile' })) {
          var first = node.specifiers && node.specifiers[0];
          if (t.isImportDefaultSpecifier(first)) {
            file.importSpecifier = first.local.name;
          } else {
            var input = file.code;
            var usedImportStatement = input.slice(node.start, node.end);
            var msg = "Only `import hbs from '" + HANDLEBARS + "'` is supported. You used: `" + usedImportStatement + "`";
            throw file.errorWithNode(node, msg);
          }

          // Prefer calling dangerouslyRemove instead of remove (if present) to
          // suppress a deprecation warning.
          //
          // TODO: delete the fallback once we only support babel >= 5.5.0.
          if (typeof this.dangerouslyRemove === 'function') {
            this.dangerouslyRemove();
          } else {
            this.remove();
          }

          file[HANDLEBARS] = file.addImport('handlebars.runtime').name;
          file[GET] = file.addImport('ember-metal/get').name;
        }
      },

      CallExpression: function (node, parent, scope, file) {
        if (t.isIdentifier(node.callee, { name: file.importSpecifier })) {
          var argumentErrorMsg = "hbs should be invoked with a single argument: the template string";
          if (node.arguments.length !== 1) {
            throw file.errorWithNode(node, argumentErrorMsg);
          }

          var template = node.arguments[0].value;
          if (typeof template !== "string") {
            throw file.errorWithNode(node, argumentErrorMsg);
          }

          return compile(this, template, file[HANDLEBARS], file[GET]);
        }
      },

      TaggedTemplateExpression: function (node, parent, scope, file) {
        if (t.isIdentifier(node.tag, { name: file.importSpecifier })) {
          if (node.quasi.expressions.length) {
            throw file.errorWithNode(node, "placeholders inside a tagged template string are not supported");
          }

          var template = node.quasi.quasis.map(function(quasi) {
            return quasi.value.cooked;
          }).join("");

          return compile(this, template, file[HANDLEBARS], file[GET]);
        }
      }
    });
  };
};
