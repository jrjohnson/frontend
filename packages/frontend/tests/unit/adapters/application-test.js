import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('ApplicationAdapter', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    var adapter = this.owner.lookup('adapter:application');
    assert.ok(adapter);
  });
});
