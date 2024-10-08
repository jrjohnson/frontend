import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | progress bar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders at default 0%', async function (assert) {
    await render(hbs`<ProgressBar />`);

    assert.dom(this.element).hasText('0%');
  });

  test('changing percentage changes width', async function (assert) {
    this.set('passedValue', 42);

    await render(hbs`<ProgressBar @percentage={{this.passedValue}} />`);

    assert.strictEqual(find('.meter').getAttribute('style').trim(), 'width: 42%');

    this.set('passedValue', 12);
    assert.strictEqual(find('.meter').getAttribute('style').trim(), 'width: 12%');
  });

  test('changing percentage changes the displayvalue', async function (assert) {
    this.set('passedValue', 42);

    await render(hbs`<ProgressBar @percentage={{this.passedValue}} />`);

    assert.dom(this.element).hasText('42%');

    this.set('passedValue', 11);
    assert.dom(this.element).hasText('11%');
  });
});
