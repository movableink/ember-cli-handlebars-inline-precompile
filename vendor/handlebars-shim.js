Handlebars.instance = Handlebars.create();
Handlebars.helpers.lookup = function (object, propertyName) {
  return object && require('ember-metal/get')['default'].get(object, propertyName);
};
