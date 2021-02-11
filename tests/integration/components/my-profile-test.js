import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/my-profile';

module('Integration | Component | my profile', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const program1 = this.server.create('program', { school });
    const program2 = this.server.create('program', { school });
    const programYear1 = this.server.create('program-year', { program: program1 });
    const programYear2 = this.server.create('program-year', { program: program1 });
    const programYear3 = this.server.create('program-year', { program: program2 });
    const cohort1 = this.server.create('cohort', {
      title: 'test cohort',
      programYear: programYear1,
    });
    const cohort2 = this.server.create('cohort', {
      title: 'second cohort',
      programYear: programYear2,
    });
    const cohort3 = this.server.create('cohort', {
      title: 'a third cohort',
      programYear: programYear3,
    });
    const studentRole = this.server.create('user-role', {
      title: 'Student',
    });
    const user = this.server.create('user', {
      displayName: 'test name',
      roles: [studentRole],
      school,
      primaryCohort: cohort1,
      cohorts: [cohort1, cohort2, cohort3],
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('user', userModel);
    await render(hbs`<MyProfile
      @user={{user}}
      @toggleShowCreateNewToken={{noop}}
      @toggleShowInvalidateTokens={{noop}}
    />`);

    assert.equal(component.name, 'test name');
    assert.ok(component.userIsStudent);
    assert.equal(component.primarySchool, 'school 0');
    assert.equal(component.primaryCohort, 'test cohort');
    assert.equal(component.secondaryCohorts.length, 2);
    assert.equal(component.secondaryCohorts[0].text, 'a third cohort program 1');
    assert.equal(component.secondaryCohorts[1].text, 'second cohort program 0');
    assert.ok(component.tokenInfoLink.includes('/api'));
  });

  test('it renders all no', async function (assert) {
    const user = this.server.create('user', {
      displayName: 'test name',
      userSyncIgnore: false,
    });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('user', userModel);
    await render(hbs`<MyProfile
      @user={{user}}
      @toggleShowCreateNewToken={{noop}}
      @toggleShowInvalidateTokens={{noop}}
    />`);

    assert.notOk(component.userIsStudent);
    assert.equal(component.primarySchool, 'Unassigned');
    assert.equal(component.primaryCohort, 'Unassigned');
    assert.equal(component.secondaryCohorts.length, 1);
    assert.equal(component.secondaryCohorts[0].text, 'Unassigned');
  });

  test('generates token when asked with good expiration date', async function (assert) {
    assert.expect(6);

    this.server.get(`/auth/token`, (scheme, { queryParams }) => {
      assert.ok('ttl' in queryParams);
      const duration = moment.duration(queryParams.ttl);
      assert.equal(duration.weeks(), 2);
      assert.ok(duration.hours() < 24);
      assert.ok(duration.minutes() < 60);
      assert.ok(duration.seconds() < 60);

      return {
        jwt: 'new token',
      };
    });

    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('user', userModel);
    await render(hbs`<MyProfile
      @user={{this.user}}
      @showCreateNewToken={{true}}
      @toggleShowCreateNewToken={{noop}}
      @toggleShowInvalidateTokens={{noop}}
    />`);

    await component.newTokenForm.submit();
    assert.equal(component.newTokenResult.value, 'new token');
  });

  test('clear and reset from new token screen', async function (assert) {
    assert.expect(3);

    this.server.get(`/auth/token`, () => {
      return {
        jwt: 'new token',
      };
    });

    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('user', userModel);
    this.set('toggle', () => {
      assert.ok(true);
    });
    await render(hbs`<MyProfile
      @user={{this.user}}
      @showCreateNewToken={{true}}
      @toggleShowCreateNewToken={{this.toggle}}
    />`);

    await component.newTokenForm.submit();
    assert.equal(component.newTokenResult.value, 'new token');
    assert.notOk(component.newTokenForm.isVisible);
    await component.newTokenResult.reset();
  });

  test('clicking button fires show token event', async function (assert) {
    assert.expect(1);

    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('user', userModel);
    this.set('toggle', () => {
      assert.ok(true);
    });
    await render(hbs`<MyProfile
      @user={{this.user}}
      @toggleShowCreateNewToken={{this.toggle}}
      @toggleShowInvalidateTokens={{noop}}
    />`);

    await component.showCreateNewTokenForm();
  });

  test('Setting date changes request length', async function (assert) {
    assert.expect(5);

    this.server.get(`/auth/token`, (scheme, { queryParams }) => {
      assert.ok('ttl' in queryParams);
      const duration = moment.duration(queryParams.ttl);
      assert.ok(duration.days() < 41);
      assert.ok(duration.hours() < 24);
      assert.ok(duration.minutes() < 60);
      assert.ok(duration.seconds() < 60);

      return {
        jwt: 'new token',
      };
    });

    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('user', userModel);
    await render(hbs`<MyProfile
      @user={{this.user}}
      @showCreateNewToken={{true}}
      @toggleShowCreateNewToken={{noop}}
      @toggleShowInvalidateTokens={{noop}}
    />`);

    const m = moment().add(41, 'days');
    await component.newTokenForm.setDate(m.toDate());
    await component.newTokenForm.submit();
  });

  test('clicking button fires invalidate tokens event', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('user', userModel);
    this.set('toggle', () => {
      assert.ok(true);
    });
    await render(hbs`<MyProfile
      @user={{this.user}}
      @toggleShowCreateNewToken={{noop}}
      @toggleShowInvalidateTokens={{this.toggle}}
    />`);

    await component.showInvalidateTokensForm();
  });

  test('invalidate tokens when asked', async function (assert) {
    assert.expect(4);

    this.server.get(`/auth/invalidatetokens`, () => {
      assert.ok(true, 'route is hit');
      return {
        jwt: 'new token',
      };
    });
    const sessionMock = Service.extend({
      authenticate(how, obj) {
        assert.equal(how, 'authenticator:ilios-jwt');
        assert.ok(obj.jwt);
        assert.equal(obj.jwt, 'new token');
      },
    });
    this.owner.register('service:session', sessionMock);
    this.session = this.owner.lookup('service:session');
    this.flashMessages = this.owner.lookup('service:flashMessages');
    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    this.set('user', userModel);
    await render(hbs`<MyProfile
      @user={{this.user}}
      @showInvalidateTokens={{true}}
      @toggleShowCreateNewToken={{noop}}
      @toggleShowInvalidateTokens={{noop}}
    />`);

    await component.invalidateTokensForm.submit();
  });
});
