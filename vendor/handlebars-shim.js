Handlebars.instance = Handlebars.create();
Handlebars.instance.helpers.get = function (property) {
  return require('ember-metal/get')['default'](this, property);
};
