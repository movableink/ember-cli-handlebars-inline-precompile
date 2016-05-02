/* jshint node: true */
'use strict';

var Handlebars = require('handlebars');
var handlebarsInlinePrecompilePlugin = require('./lib/handlebars-inline-precompile-plugin');

module.exports = {
  name: 'ember-cli-handlebars-inline-precompile',

  included: function (app) {
    this._super.included(app);

    app.options = app.options || {};
    app.options.babel = app.options.babel || {};
    app.options.babel.plugins = app.options.babel.plugins || [];

    handlebarsInlinePrecompilePlugin(Handlebars.precompile);

    // add the HandlebarsInlinePrecompilePlugin to the list of plugins used by
    // the `ember-cli-babel` addon
    if (!this._registeredWithBabel) {
      app.options.babel.plugins.push(handlebarsInlinePrecompilePlugin);
      this._registeredWithBabel = true;
    }
  },

  // borrowed from ember-cli-htmlbars http://git.io/vJDrW
  projectConfig: function () {
    return this.project.config(process.env.EMBER_ENV);
  }
};
