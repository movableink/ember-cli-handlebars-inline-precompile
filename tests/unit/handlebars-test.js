import EmObject from '@ember/object';
import { computed } from '@ember/object';
import hbs from 'handlebars-inline-precompile';
import { module, test } from 'qunit';

module('handlebars');

test('handlebars are a function', function (assert) {
  let template = hbs`Hello, {{name}}`;

  assert.equal(template({ name: 'world' }), 'Hello, world');
});

test('templates understand computed properties using lookup', function (assert) {
  let template = hbs`Hello, {{name}}`;

  assert.equal(template(EmObject.extend({
    name: computed({
      get() {
        return 'world';
      }
    })
  }).create()), 'Hello, world');
});

test('property paths are gettable', function (assert) {
  let template = hbs`<h1 style="font-size: {{styles.fontSize}}px">Hello!</h1>`;

  assert.equal(template(EmObject.extend({
    styles: computed({
      get() {
        return {
          fontSize: 12
        };
      }
    })
  }).create()), '<h1 style="font-size: 12px">Hello!</h1>');
});

test('property paths in an {{each}} are gettable', function (assert) {
  let template = hbs`{{#each cats as |cat|}}{{cat.name}} {{/each}}`;

  let Cat = EmObject.extend();
  assert.equal(template(EmObject.extend({
    cats: computed({
      get() {
        return [
          Cat.create({ name: 'Mister Fussyboots' }),
          Cat.create({ name: 'Missus Sassypants' })
        ];
      }
    })
  }).create()), 'Mister Fussyboots Missus Sassypants ');
});
