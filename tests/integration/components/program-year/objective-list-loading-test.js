import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | program-year/objective-list-loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<ProgramYear::ObjectiveListLoading @count={{9}} />`);

    assert.dom('.grid-row').exists({ count: 9 });
  });
});
