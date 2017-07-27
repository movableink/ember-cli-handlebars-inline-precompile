# ember-cli-handlebars-inline-precompile [![Build Status](https://travis-ci.org/movableink/ember-cli-handlebars-inline-precompile.svg?branch=master)](https://travis-ci.org/movableink/ember-cli-handlebars-inline-precompile)

Used for precompiling static Handlebar templates for use in generating templates. This is **not** intended for use in Ember's rendering engine!

**If you want a Babel 6 compatible version, use the latest commit on the `ember2-14` branch**

## Usage

This addon will transpile tagged templates into Handlebars templates. From there, these templates can be invoked as a function with a context, just like any other Handlebars template.

```javascript
import Ember from 'ember';
import hbs from 'handlebars-inline-precompile';

const { computed, get } = Ember;

export default Ember.Object.extend({
  fontSize: 12,

  sections: []

  template: hbs`
    \documentclass[{{fontSize}}pt]{article}
    \begin{document}

    {{#each sections as |section|}}
      {{{section.latex}}}
    {{/each}}

    \end{document}
  `,

  latex: computed({
    get() {
      return get(this, 'template')(this);
    }
  }).volatile()
});
```

This object represents a LaTeX document, which can be serialized into
it's raw form using a declarative template. This addon supports Ember
Objects in properties, which means computed properties are accessible
by a property declaration in your Handlebars.

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
