Handlebars.instance = Handlebars.create();
Handlebars.instance.helpers.lookup = function (object, property) {
  return object && require('ember-metal/get')['default'](object, property);
};
