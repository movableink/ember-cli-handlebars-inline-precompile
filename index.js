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

    // add the HandlebarsInlinePrecompilePlugin to the list of plugins used by
    // the `ember-cli-babel` addon
    if (!this._registeredWithBabel) {
      let fn = new HandlebarsInlinePrecompilePlugin(Handlebars);
      fn.baseDir = function() {
        return __dirname;
      }
      app.options.babel.plugins.push(fn);
      this._registeredWithBabel = true;
    }

    app.import('bower_components/handlebars/handlebars.runtime.amd.js');
  }
};
