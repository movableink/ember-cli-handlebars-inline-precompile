/* jshint node: true */
'use strict';

var Handlebars = require('handlebars');
var HandlebarsInlinePrecompilePlugin = require('./lib/handlebars-inline-precompile-plugin');
var path = require('path');
var Funnel = require('broccoli-funnel');
var MergeTrees = require('broccoli-merge-trees');

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
  },

  treeForAddon: function() {
    var addonTree = this._super.treeForAddon.apply(this, arguments);

    var dir = path.resolve(require.resolve('handlebars'), '..', '..');

    var handlebars = new Funnel(dir, {
      files: ['dist/handlebars.runtime.amd.js']
    });

    return new MergeTrees([addonTree, handlebars]);
  }
};
