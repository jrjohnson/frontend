import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('school-vocabulary-manager', 'Integration | Component | school vocabulary manager', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{school-vocabulary-manager}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#school-vocabulary-manager}}
      template block text
    {{/school-vocabulary-manager}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
