/* jshint node: true */
'use strict';

var HANDLEBARS = 'handlebars-inline-precompile';

module.exports = function (Handlebars) {
  return function (babel) {
    var t = babel.types;

    var compile = function (path, template, hbs) {
      var nameLookup = Handlebars.JavaScriptCompiler.prototype.nameLookup;
      Handlebars.JavaScriptCompiler.prototype.nameLookup = function (parent, name, type) {
        if (type === 'context') {
          return ['Ember.get(', parent, ', "', name, '")'];
        } else {
          const comp = nameLookup.call(this, parent, name, type);
          return comp;
        }
      };

      var compiledTemplateString = hbs + '.template(' + Handlebars.precompile(template) + ')';
      //console.log(`cts: ${compiledTemplateString}`);
      Handlebars.JavaScriptCompiler.prototype.nameLookup = nameLookup;

      // TODO: delete the fallback once we only support babel >= 5.6.7.
      path.replaceWithSourceString(compiledTemplateString);
    };

    return {
      visitor: {
        ImportDeclaration: function (path, state) {
          var node = path.node;
          var file = state.file;
          //console.log(`id0: ${node.source.value}`);
          if (t.isLiteral(node.source, { value: 'handlebars-inline-precompile' })) {
            var first = node.specifiers && node.specifiers[0];

            if (t.isImportDefaultSpecifier(first)) {
              //this is used in TaggedTemplateExpression to filter 'hbs' expressions
              file.importSpecifier = first.local.name;
            } else {
              var input = file.code;
              var usedImportStatement = input.slice(node.start, node.end);
              var msg = "Only `import hbs from '" + HANDLEBARS + "'` is supported. You used: `" + usedImportStatement + "`";
              throw path.buildCodeFrameError(msg);
            }
            path.remove();
            const importName = file.addImport('handlebars.runtime', 'default').name;
            file[HANDLEBARS] = importName;
          }
        },

        CallExpression: function (path, state) {
          var node = path.node;
          var file = state.file;
          if (t.isIdentifier(node.callee, { name: file.importSpecifier })) {
            console.log(`ce: ${node.callee}`);
            var argumentErrorMsg = "hbs should be invoked with a single argument: the template string";
            if (node.arguments.length !== 1) {
              throw file.errorWithNode(node, argumentErrorMsg);
            }

            var template = node.arguments[0].value;
            if (typeof template !== "string") {
              throw file.buildCodeFrameError(argumentErrorMsg);
            }
            //console.log(`ce-template: ${template}`);
            compile(path, template, file[HANDLEBARS]);
          }
        },

        TaggedTemplateExpression: function (path, state) {
          var node = path.node;
          var file = state.file;
          if (t.isIdentifier(node.tag, { name: file.importSpecifier })) {
            //will be 'hbs' or whatever you've imported the addon as
            //is set in ImportDeclaration
            if (node.quasi.expressions.length) {
              throw path.buildCodeFrameError("placeholders inside a tagged template string are not supported");
            }

            var template = node.quasi.quasis.map(function(quasi) {
              return quasi.value.cooked;
            }).join("");

            compile(path, template, file[HANDLEBARS]);
          }
        }
      }
    };
  };
};
