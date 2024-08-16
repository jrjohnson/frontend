import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'frontend/tests/test-support/mirage';

module('Unit | Service | reporting', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'en-us');
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
    const title = await this.service.buildReportTitle(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
    );
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
    const title = await this.service.buildReportTitle(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
      school,
    );
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
      prepositionalObject: 'instructor',
      subject: 'competency',
      prepositionalObjectTableRowId: user.id,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const userModel = await store.findRecord('user', user.id);
    const title = await this.service.buildReportTitle(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
      school,
    );
    assert.strictEqual(title, 'All Competencies for ' + userModel.fullName + ' in ' + school.title);
  });

  test('buildReportTitle() - broken report', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      school,
      prepositionalObject: 'instructor',
      subject: 'competency',
      prepositionalObjectTableRowId: 13,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const title = await this.service.buildReportTitle(
      reportModel.subject,
      reportModel.prepositionalObject,
      school,
      reportModel.prepositionalObjectTableRowId,
    );
    assert.strictEqual(title, 'This report is no longer available.');
  });

  test('buildReportDescription() - all competencies in all schools', async function (assert) {
    const report = this.server.create('report', {
      subject: 'competency',
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const title = await this.service.buildReportDescription(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
    );
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
    const title = await this.service.buildReportDescription(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
      school,
    );
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
    const title = await this.service.buildReportDescription(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
      school,
    );
    assert.strictEqual(
      title,
      `This report shows all Courses associated with Instructor "${userModel.fullName}"  in ${school.title}.`,
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
    const title = await this.service.buildReportDescription(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
      school,
    );
    assert.strictEqual(
      title,
      `This report shows all Terms associated with Course "${courseModel.title}" (${courseModel.year}) in ${schoolModel.title}.`,
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
    const title = await this.service.buildReportDescription(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
      school,
    );
    assert.strictEqual(
      title,
      `This report shows all Terms associated with Course "${courseModel.title}" (${
        courseModel.year
      } - ${courseModel.year + 1}) in ${schoolModel.title}.`,
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
    const title = await this.service.buildReportDescription(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
      school,
    );
    assert.strictEqual(title, 'This report is no longer available.');
  });

  test('getDescriptiveProperties() - with prepositional object', async function (assert) {
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
    const props = await this.service.getDescriptiveProperties(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
      school,
    );

    assert.strictEqual(props.object, 'course 0');
    assert.strictEqual(props.objectType, 'Course');
    assert.strictEqual(props.school, 'School of Schools');
    assert.strictEqual(props.subject, 'Terms');
    assert.strictEqual(props.year, '(2023 - 2024)');
  });

  test('getDescriptiveProperties() - without prepositional object, all schools', async function (assert) {
    const report = this.server.create('report', {
      subject: 'competency',
    });
    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const props = await this.service.getDescriptiveProperties(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
    );
    assert.notOk(props.object);
    assert.notOk(props.objectType);
    assert.notOk(props.year);
    assert.strictEqual(props.school, 'All Schools');
    assert.strictEqual(props.subject, 'Competencies');
  });

  test('getDescriptiveProperties() - without prepositional object, school X', async function (assert) {
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      subject: 'competency',
      school,
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const props = await this.service.getDescriptiveProperties(
      reportModel.subject,
      reportModel.prepositionalObject,
      reportModel.prepositionalObjectTableRowId,
      school,
    );
    assert.notOk(props.object);
    assert.notOk(props.objectType);
    assert.notOk(props.year);
    assert.strictEqual(props.school, 'School of Schools');
    assert.strictEqual(props.subject, 'Competencies');
  });

  test('getArrayResults() for term report', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school', { title: 'School of Schools' });
    const report = this.server.create('report', {
      subject: 'term',
      school,
    });
    const vocabulary = this.server.create('vocabulary', { school });
    const terms = this.server.createList('term', 2, { vocabulary });
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { terms(schools: [1]) { id } }');
      return {
        data: {
          terms: terms.reverse().map(({ id }) => ({ id })),
        },
      };
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const props = await this.service.getArrayResults(reportModel, 1999);
    assert.deepEqual(props, [['Vocabulary'], ['Vocabulary 1 > term 0'], ['Vocabulary 1 > term 1']]);
  });

  test('getArrayResults() for instructor report', async function (assert) {
    assert.expect(2);
    const report = this.server.create('report', {
      subject: 'instructor',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 42,
    });
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        `query { courses(id: 42) { sessions {
        ilmSession { instructorGroups {  users { id firstName middleName lastName displayName }} instructors { id firstName middleName lastName displayName } }
        offerings { instructorGroups {  users { id firstName middleName lastName displayName }} instructors { id firstName middleName lastName displayName } }
      } } }`,
      );
      return {
        data: {
          courses: [
            {
              sessions: [
                {
                  ilmSession: {
                    instructors: [
                      {
                        id: 1,
                        firstName: 'F',
                        middleName: '1',
                        lastName: 'L',
                        displayName: '',
                      },
                    ],
                    instructorGroups: [
                      {
                        users: [
                          {
                            id: 2,
                            firstName: 'F',
                            middleName: '2',
                            lastName: 'L',
                            displayName: '',
                          },
                        ],
                      },
                    ],
                  },
                  offerings: [
                    {
                      instructors: [
                        {
                          id: 3,
                          firstName: 'F',
                          middleName: '',
                          lastName: 'L',
                          displayName: 'o1i',
                        },
                        {
                          id: 2,
                          firstName: 'F',
                          middleName: '2',
                          lastName: 'L',
                          displayName: '',
                        },
                      ],
                      instructorGroups: [
                        {
                          users: [
                            {
                              id: 4,
                              firstName: 'F',
                              middleName: '',
                              lastName: 'L',
                              displayName: 'o1ig',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      instructors: [
                        {
                          id: 5,
                          firstName: 'F',
                          middleName: '',
                          lastName: 'L',
                          displayName: 'o2i',
                        },
                      ],
                      instructorGroups: [
                        {
                          users: [
                            {
                              id: 6,
                              firstName: 'F',
                              middleName: '',
                              lastName: 'L',
                              displayName: 'o2ig',
                            },
                            {
                              id: 2,
                              firstName: 'F',
                              middleName: '2',
                              lastName: 'L',
                              displayName: '',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };
    });

    const store = this.owner.lookup('service:store');
    const reportModel = await store.findRecord('report', report.id);
    const props = await this.service.getArrayResults(reportModel, 1999);
    assert.deepEqual(props, [
      ['Instructors'],
      ['F 1. L'],
      ['F 2. L'],
      ['o1i'],
      ['o1ig'],
      ['o2i'],
      ['o2ig'],
    ]);
  });
});
