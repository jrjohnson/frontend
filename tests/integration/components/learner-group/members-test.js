import ObjectProxy from '@ember/object/proxy';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'frontend/tests/pages/components/learner-group/members';

module('Integration | Component | learner-group/members', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const learnerGroup = this.server.create('learnerGroup', { id: 1 });
    const user1 = this.server.create('user', {
      firstName: 'Jasper',
      lastName: 'Dog',
      campusId: '1234',
      email: 'testemail',
      enabled: true,
      learnerGroups: [learnerGroup],
    });
    const user2 = this.server.create('user', {
      firstName: 'Jackson',
      lastName: 'Doggy',
      campusId: '123',
      email: 'testemail2',
      enabled: false,
      learnerGroups: [learnerGroup],
    });
    const userModel1 = await this.owner.lookup('service:store').findRecord('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    this.learnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
    this.userProxy1 = ObjectProxy.create({
      content: userModel1,
      lowestGroupInTree: this.learnerGroup,
      lowestGroupInTreeTitle: this.learnerGroup.title,
    });
    this.userProxy2 = ObjectProxy.create({
      content: userModel2,
      lowestGroupInTree: this.learnerGroup,
      lowestGroupInTreeTitle: this.learnerGroup.title,
    });
  });

  test('it renders', async function (assert) {
    this.set('users', [this.userProxy1, this.userProxy2]);
    this.set('learnerGroup', this.learnerGroup);
    await render(hbs`<LearnerGroup::Members
      @learnerGroupId={{this.learnerGroup.id}}
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
    />`);
    assert.strictEqual(component.users.length, 2);
    assert.strictEqual(component.users[0].name.userNameInfo.fullName, 'Jasper M. Dog');
    assert.strictEqual(component.users[0].campusId.text, '1234');
    assert.strictEqual(component.users[0].email.text, 'testemail');
    assert.strictEqual(component.users[1].name.userNameInfo.fullName, 'Jackson M. Doggy');
    assert.strictEqual(component.users[1].campusId.text, '123');
    assert.strictEqual(component.users[1].email.text, 'testemail2');
  });

  test('filtering', async function (assert) {
    this.set('users', [this.userProxy1, this.userProxy2]);
    this.set('learnerGroup', this.learnerGroup);
    await render(hbs`<LearnerGroup::Members
      @learnerGroupId={{this.learnerGroup.id}}
      @users={{this.users}}
      @sortBy="id"
      @setSortBy={{(noop)}}
    />`);
    assert.strictEqual(component.users.length, 2);
    assert.strictEqual(component.users[0].name.userNameInfo.fullName, 'Jasper M. Dog');
    assert.strictEqual(component.users[1].name.userNameInfo.fullName, 'Jackson M. Doggy');
    await component.filter('Jackson');
    assert.strictEqual(component.users.length, 1);
    assert.strictEqual(component.users[0].name.userNameInfo.fullName, 'Jackson M. Doggy');
    await component.filter('');
    assert.strictEqual(component.users.length, 2);
    assert.strictEqual(component.users[0].name.userNameInfo.fullName, 'Jasper M. Dog');
    assert.strictEqual(component.users[1].name.userNameInfo.fullName, 'Jackson M. Doggy');
  });
});
