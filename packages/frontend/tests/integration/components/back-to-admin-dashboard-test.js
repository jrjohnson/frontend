import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'frontend/tests/pages/components/back-to-admin-dashboard';

module('Integration | Component | back-to-admin-dashboard', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<BackToAdminDashboard />`);
    assert.strictEqual(component.text, 'Back to Admin Dashboard');
    assert.ok(component.url.endsWith('/admin'));
  });
});
