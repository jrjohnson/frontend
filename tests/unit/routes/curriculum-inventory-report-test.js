import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | curriculum-inventory-report', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:curriculum-inventory-report');
    assert.ok(route);
  });
});
