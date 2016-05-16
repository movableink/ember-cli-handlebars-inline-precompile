import Ember from 'ember';
import hbs from 'handlebars-inline-precompile';
import { module, test } from 'qunit';

module('handlebars');

test('handlebars are a function', function (assert) {
  let template = hbs`Hello, {{name}}`;

  assert.equal(template({ name: 'world' }), 'Hello, world');
});

test('templates understand computed properties using lookup', function (assert) {
  let template = hbs`Hello, {{name}}`;

  assert.equal(template(Ember.Object.extend({
    name: Ember.computed({
      get() {
        return 'world';
      }
    })
  }).create()), 'Hello, world');
});

test('property paths are gettable', function (assert) {
  let template = hbs`<h1 style="font-size: {{styles.fontSize}}px">Hello!</h1>`;

  assert.equal(template(Ember.Object.extend({
    styles: Ember.computed({
      get() {
        return {
          fontSize: 12
        };
      }
    })
  }).create()), '<h1 style="font-size: 12px">Hello!</h1>');
});
