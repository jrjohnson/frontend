import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'frontend/tests/pages/components/school/leadership-expanded';

module('Integration | Component | school/leadership-expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const user1 = this.server.create('user');
    const user2 = this.server.create('user');
    const school = this.server.create('school', {
      directors: [user1],
      administrators: [user1, user2],
    });

    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<School::LeadershipExpanded
      @school={{this.school}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    assert.strictEqual(component.title, 'Leadership (3)');
    assert.strictEqual(component.leadershipList.directors.length, 1);
    assert.strictEqual(component.leadershipList.directors[0].text, '0 guy M. Mc0son');
    assert.strictEqual(component.leadershipList.administrators.length, 2);
    assert.strictEqual(component.leadershipList.administrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(component.leadershipList.administrators[1].text, '1 guy M. Mc1son');
  });

  test('clicking the header collapses', async function (assert) {
    assert.expect(1);
    const user1 = this.server.create('user');
    const school = this.server.create('school', {
      directors: [user1],
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('collapse', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<School::LeadershipExpanded
      @school={{this.school}}
      @editable={{true}}
      @collapse={{this.collapse}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    await component.collapse();
  });

  test('clicking manage fires action', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school', {});
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('manage', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<School::LeadershipExpanded
      @school={{this.school}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{this.manage}}
    />`);

    await component.manage();
  });

  // @link https://github.com/ilios/frontend/issues/5732
  test('managing mode', async function (assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<School::LeadershipExpanded
      @school={{this.school}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{true}}
      @setIsManaging={{(noop)}}
    />`);

    assert.ok(component.leadershipManager.isVisible);
  });
});
