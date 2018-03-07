import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | loading-spinner', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{loading-spinner}}`);

    assert.equal(find('*').textContent.trim(), '');
    assert.ok(find('i').classList.contains('fa-spinner'));
  });
});
