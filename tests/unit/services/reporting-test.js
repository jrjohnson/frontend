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

  test('buildReportDescription() - all competencies in all schools', async function (assert) {
    const report = this.server.create('report', {
      subject: 'competency',
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const title = await this.service.buildReportDescription(reportModel, store, this.intl);
    assert.strictEqual(title, 'This report shows all Competencies in All Schools.');
  });

  test('buildReportDescription() - all competencies in school X', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      school,
      subject: 'competency',
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const title = await this.service.buildReportDescription(reportModel, store, this.intl);
    assert.strictEqual(title, `This report shows all Competencies in ${school.title}.`);
  });

  test('buildReportDescription() - all courses for instructor X in school Y', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const user = this.server.create('user', {
      firstName: 'Chip',
      lastName: 'Whitley',
    });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'instructor',
      subject: 'course',
      prepositionalObjectTableRowId: user.id,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const userModel = await store.findRecord('user', user.id);
    const title = await this.service.buildReportDescription(reportModel, store, this.intl);
    assert.strictEqual(
      title,
      `This report shows all Courses associated with Instructor "${userModel.fullName}"  in ${school.title}.`
    );
  });

  test('buildReportDescription() - all terms for course X in school Y', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const course = this.server.create('course', { school, year: 2023 });
    const vocabulary = this.server.create('vocabulary', { school });
    this.server.create('term', {
      title: 'foo bar',
      courses: [course],
      vocabulary,
    });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'course',
      subject: 'term',
      prepositionalObjectTableRowId: course.id,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const courseModel = await store.findRecord('course', course.id);
    const schoolModel = await store.findRecord('school', school.id);
    const title = await this.service.buildReportDescription(reportModel, store, this.intl);
    assert.strictEqual(
      title,
      `This report shows all Terms associated with Course "${courseModel.title}" (${courseModel.year}) in ${schoolModel.title}.`
    );
  });

  test('buildReportDescription() - all terms for course X in school Y with year-range', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    const school = this.server.create('school', { title: 'School of Schools' });
    const course = this.server.create('course', { school, year: 2023 });
    const vocabulary = this.server.create('vocabulary', { school });
    this.server.create('term', {
      title: 'foo bar',
      courses: [course],
      vocabulary,
    });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'course',
      subject: 'term',
      prepositionalObjectTableRowId: course.id,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const courseModel = await store.findRecord('course', course.id);
    const schoolModel = await store.findRecord('school', school.id);
    const title = await this.service.buildReportDescription(reportModel, store, this.intl);
    assert.strictEqual(
      title,
      `This report shows all Terms associated with Course "${courseModel.title}" (${
        courseModel.year
      } - ${courseModel.year + 1}) in ${schoolModel.title}.`
    );
  });

  test('buildReportDescription() - broken report', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'user',
      subject: 'competency',
      prepositionalObjectTableRowId: 13,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const title = await this.service.buildReportDescription(reportModel, store, this.intl);
    assert.strictEqual(title, 'This report is no longer available.');
  });
});
