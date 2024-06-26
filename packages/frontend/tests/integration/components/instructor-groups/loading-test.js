import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | instructor-groups/loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<InstructorGroups::Loading @count={{4}} />`);
    assert.dom('tbody tr').exists({ count: 4 });
    await a11yAudit(this.element);
  });
});
