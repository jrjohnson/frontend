import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Service | reporting', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.service = this.owner.lookup('service:reporting');
  });

  test('buildReportTitle() - custom title', async function (assert) {
    const report = this.server.create('report', {
      title: 'Lorem Ipsum',
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const title = await this.service.buildReportTitle(reportModel, store, this.intl);
    assert.strictEqual(title, report.title);
  });

  test('buildReportTitle() - all competencies in all schools', async function (assert) {
    const report = this.server.create('report', {
      subject: 'competency',
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const title = await this.service.buildReportTitle(reportModel, store, this.intl);
    assert.strictEqual(title, 'All Competencies in All Schools');
  });

  test('buildReportTitle() - all competencies in school X', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      school,
      subject: 'competency',
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const title = await this.service.buildReportTitle(reportModel, store, this.intl);
    assert.strictEqual(title, 'All Competencies in ' + school.title);
  });

  test('buildReportTitle() - all competencies for user X in school Y', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const user = this.server.create('user', {
      firstName: 'Chip',
      lastName: 'Whitley',
    });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'user',
      subject: 'competency',
      prepositionalObjectTableRowId: user.id,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const userModel = await store.findRecord('user', user.id);
    const title = await this.service.buildReportTitle(reportModel, store, this.intl);
    assert.strictEqual(title, 'All Competencies for ' + userModel.fullName + ' in ' + school.title);
  });

  test('buildReportTitle() - broken report', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'user',
      subject: 'competency',
      prepositionalObjectTableRowId: 13,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const title = await this.service.buildReportTitle(reportModel, store, this.intl);
    assert.strictEqual(title, 'This report is no longer available.');
  });
});
