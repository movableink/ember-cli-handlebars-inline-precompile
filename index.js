/* jshint node: true */
'use strict';

var Handlebars = require('handlebars');
var HandlebarsInlinePrecompilePlugin = require('./lib/handlebars-inline-precompile-plugin');

module.exports = {
  name: 'ember-cli-handlebars-inline-precompile',

  included: function (app) {
    this._super.included(app);

    app.options = app.options || {};
    app.options.babel = app.options.babel || {};
    app.options.babel.plugins = app.options.babel.plugins || [];

    var nameLookup = Handlebars.JavaScriptCompiler.prototype.nameLookup;
    Handlebars.JavaScriptCompiler.prototype.nameLookup = function (parent, name, type) {
      if (type === 'context') {
        return ["require('ember-metal/get')['default'](", parent, ', "', name, '")'];
      } else {
        return nameLookup.call(this, parent, name, type);
      }
    };

    var PrecompileInlineHandlebarsPlugin = HandlebarsInlinePrecompilePlugin(Handlebars.precompile);

    // add the HandlebarsInlinePrecompilePlugin to the list of plugins used by
    // the `ember-cli-babel` addon
    if (!this._registeredWithBabel) {
      app.options.babel.plugins.push(PrecompileInlineHandlebarsPlugin);
      this._registeredWithBabel = true;
    }

    app.import('bower_components/handlebars/handlebars.runtime.js');
    app.import('vendor/handlebars-shim.js');
  }
};
