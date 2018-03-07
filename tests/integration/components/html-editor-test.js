import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | html editor', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{html-editor}}`);

    assert.equal(find('*').textContent.trim(), 'BoldItalicSubscriptSuperscriptOrdered ListUnordered ListInsert Link');

  });
});
