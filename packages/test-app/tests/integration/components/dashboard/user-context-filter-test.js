import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/dashboard/user-context-filter';

module('Integration | Component | dashboard/user-context-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<Dashboard::UserContextFilter />`);
    assert.strictEqual(component.instructing.label, 'Instructing');
    assert.notOk(component.instructing.isChecked);
    assert.strictEqual(component.learning.label, 'Learning');
    assert.notOk(component.learning.isChecked);
    assert.strictEqual(component.admin.label, 'Admin');
    assert.notOk(component.admin.isChecked);
  });

  test('selecting learning filter', async function (assert) {
    assert.expect(2);
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, 'learner');
    });
    await render(hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} />`);
    assert.notOk(component.learning.isChecked);
    await component.learning.toggle();
  });

  test('de-selecting learning filter', async function (assert) {
    assert.expect(2);
    this.set('userContext', 'learner');
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, null);
    });
    await render(
      hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} @userContext={{this.userContext}}/>`,
    );
    assert.ok(component.learning.isChecked);
    await component.learning.toggle();
  });

  test('selecting instructing filter', async function (assert) {
    assert.expect(2);
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, 'instructor');
    });
    await render(hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} />`);
    assert.notOk(component.instructing.isChecked);
    await component.instructing.toggle();
  });

  test('de-selecting instructing filter', async function (assert) {
    assert.expect(2);
    this.set('userContext', 'instructor');
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, null);
    });
    await render(
      hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} @userContext={{this.userContext}}/>`,
    );
    assert.ok(component.instructing.isChecked);
    await component.instructing.toggle();
  });

  test('selecting admin filter', async function (assert) {
    assert.expect(2);
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, 'administrator');
    });
    await render(hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} />`);
    assert.notOk(component.admin.isChecked);
    await component.admin.toggle();
  });

  test('de-selecting admin filter', async function (assert) {
    assert.expect(2);
    this.set('userContext', 'administrator');
    this.set('setUserContext', (context) => {
      assert.strictEqual(context, null);
    });
    await render(
      hbs`<Dashboard::UserContextFilter @setUserContext={{this.setUserContext}} @userContext={{this.userContext}}/>`,
    );
    assert.ok(component.admin.isChecked);
    await component.admin.toggle();
  });
});
