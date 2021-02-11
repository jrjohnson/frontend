import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, fillIn, find, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | learnergroup header', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const learnerGroup = EmberObject.create({
      title: 'our group',
      allParents: resolve([{ title: 'parent group' }]),
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`<LearnergroupHeader @learnerGroup={{learnerGroup}} />`);

    assert.dom('.title').hasText('our group');
    assert.equal(
      find('.breadcrumbs').textContent.replace(/\s/g, ''),
      'LearnerGroupsparentgroupourgroup'
    );
  });

  test('can change title', async function (assert) {
    const learnerGroup = EmberObject.create({
      title: 'our group',
      save() {
        assert.equal(this.title, 'new title');
      },
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`<LearnergroupHeader @learnerGroup={{learnerGroup}} @canUpdate={{true}} />`);

    assert.dom('.title').hasText('our group');
    await click('.title .editable');
    await fillIn('.title input', 'new title');
    await triggerEvent('.title input', 'input');
    await click('.title .done');
  });

  test('counts members correctly', async function (assert) {
    const cohort = EmberObject.create({
      title: 'test group',
      users: [1, 2],
    });
    const subGroup = EmberObject.create({
      title: 'test sub-group',
      users: [],
      children: [],
    });
    const learnerGroup = EmberObject.create({
      title: 'test group',
      usersOnlyAtThisLevel: [1],
      cohort,
      children: resolve([subGroup]),
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`<LearnergroupHeader @learnerGroup={{learnerGroup}} />`);

    assert.dom('header .info').hasText('Members: 1 / 2');
  });

  test('validate title length', async function (assert) {
    assert.expect(4);
    const title = '.title';
    const edit = `${title} .editable`;
    const input = `${title} input`;
    const done = `${title} .done`;
    const errors = `${title} .validation-error-message`;

    const learnerGroup = EmberObject.create({
      title: 'our group',
      save() {
        assert.ok(false, 'should not be called');
      },
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`<LearnergroupHeader @learnerGroup={{learnerGroup}} @canUpdate={{true}} />`);

    assert.dom(title).hasText('our group', 'title is correct');
    assert.dom(errors).doesNotExist('there are no errors');
    await click(edit);
    const longTitle = 'x'.repeat(61);
    await fillIn(input, longTitle);
    await click(done);

    assert.dom(errors).exists({ count: 1 }, 'there is now an error');
    assert.ok(find(errors).textContent.search(/too long/) > -1, 'it is the correct error');
  });
});
