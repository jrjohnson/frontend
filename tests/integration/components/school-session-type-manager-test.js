import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-session-type-manager';

module('Integration | Component | school session type manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('assessment-option', {
      name: 'formative',
    });
    this.summative = this.server.create('assessment-option', {
      name: 'summative',
    });
  });

  test('it renders', async function (assert) {
    const sessionType = this.server.create('session-type', {
      title: 'one',
      calendarColor: '#ffffff',
      assessment: true,
      assessmentOption: this.summative,
      sessionCount: 0,
    });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    this.set('sessionType', sessionTypeModel);
    await render(hbs`<SchoolSessionTypeManager
      @canUpdate={{true}}
      @sessionType={{this.sessionType}}
      @close={{noop}}
    />`);

    assert.equal(component.title, 'one');
    assert.equal(component.form.title.value, 'one');
    assert.equal(component.form.calendarColor.value, '#ffffff');
    assert.ok(component.form.assessment.isAssessment);
    assert.ok(component.form.assessmentSelector.value, '2');
  });

  test('close fires action', async function (assert) {
    assert.expect(1);
    const sessionType = this.server.create('session-type', {
      title: 'one',
      calendarColor: '#ffffff',
      assessment: true,
      assessmentOption: this.summative,
    });
    const sessionTypeModel = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    this.set('sessionType', sessionTypeModel);
    this.set('close', () => {
      assert.ok(true, 'action was fired');
    });
    await render(hbs`<SchoolSessionTypeManager
      @canUpdate={{true}}
      @sessionType={{this.sessionType}}
      @close={{this.close}}
    />`);

    await component.form.cancel.click();
  });
});
