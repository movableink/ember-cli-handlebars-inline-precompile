import hbs from 'handlebars-inline-precompile';
import { moduleFor, test } from 'ember-qunit';

moduleFor('handlebars', {
  unit: true
});

test('handlebars are a function', function () {
  let template = hbs`Hello, {{name}}`;

  assert.equal(template({ name: 'world' }), 'Hello, world');
});
