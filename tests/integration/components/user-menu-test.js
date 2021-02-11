import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import component from 'ilios/tests/pages/components/user-menu';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | user-menu', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupAuthentication();
  });

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<UserMenu />`);

    await a11yAudit(this.element);
    assert.equal(component.text, '0 guy M. Mc0son');

    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function (assert) {
    await render(hbs`<UserMenu />`);

    assert.equal(component.links.length, 0);
    await component.toggle.click();
    assert.equal(component.links.length, 3);
  });

  test('down opens menu', async function (assert) {
    await render(hbs`<UserMenu />`);

    assert.equal(component.links.length, 0);
    await component.toggle.down();
    assert.equal(component.links.length, 3);
  });

  test('escape closes menu', async function (assert) {
    await render(hbs`<UserMenu />`);

    await component.toggle.down();
    assert.equal(component.links.length, 3);
    await component.toggle.esc();
    assert.equal(component.links.length, 0);
  });

  test('click closes menu', async function (assert) {
    await render(hbs`<UserMenu />`);

    await component.toggle.down();
    assert.equal(component.links.length, 3);
    await component.toggle.click();
    assert.equal(component.links.length, 0);
  });
});
