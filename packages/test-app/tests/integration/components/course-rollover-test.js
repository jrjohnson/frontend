import Service from '@ember/service';
import { resolve } from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, click, find, findAll, fillIn, blur as emberBlur } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import { setupMirage } from 'ember-cli-mirage/test-support';
import queryString from 'query-string';

module('Integration | Component | course rollover', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseRollover @course={{this.course}} />
`);

    const lastYear = DateTime.now().minus({ year: 1 }).year;
    const yearSelect = '.year-select select';
    const title = '.title input';

    for (let i = 0; i < 6; i++) {
      assert.dom(`${yearSelect} option:nth-of-type(${i + 1})`).hasText(`${lastYear + i}`);
    }
    assert.dom(title).exists({ count: 1 });
    assert.strictEqual(find(title).value.trim(), course.title);
  });

  test('academic year options are labeled with year ranges as applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseRollover @course={{this.course}} />
`);

    const lastYear = DateTime.now().minus({ year: 1 }).year;
    const yearSelect = '.year-select select';
    for (let i = 0; i < 6; i++) {
      assert
        .dom(`${yearSelect} option:nth-of-type(${i + 1})`)
        .hasText(`${lastYear + i} - ${lastYear + i + 1}`);
    }
  });

  test('rollover course', async function (assert) {
    assert.expect(5);
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old title',
      school,
      startDate: DateTime.fromObject({ hour: 0, minute: 0, second: 0 }).toJSDate(),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      const lastYear = DateTime.now().minus({ year: 1 }).year;
      const data = queryString.parse(request.requestBody);
      assert.ok('year' in data);
      assert.strictEqual(parseInt(data.year, 10), lastYear);
      assert.strictEqual(data.newCourseTitle, course.title);
      assert.ok('newStartDate' in data);
      return this.serialize(
        schema.courses.create({
          id: 14,
          title: data.newCourseTitle,
          startDate: data.newStartDate,
          year: data.year,
        }),
      );
    });
    this.set('visit', (newCourse) => {
      assert.strictEqual(parseInt(newCourse.id, 10), 14);
    });
    await render(hbs`<CourseRollover
      @course={{this.course}}
      @visit={{this.visit}}
    />
`);
    await click('.done');
  });

  test('rollover course with new title', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old title',
      school,
      startDate: DateTime.fromObject({ hour: 0, minute: 0, second: 0 }).toJSDate(),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    const newTitle = course.title + '2';

    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      const data = queryString.parse(request.requestBody);
      assert.strictEqual(data.newCourseTitle, newTitle, 'The new title gets passed.');

      return this.serialize(
        schema.courses.create({
          id: 14,
        }),
      );
    });
    await render(hbs`<CourseRollover
      @course={{this.course}}
      @visit={{(noop)}}
    />
`);
    const title = '.title';
    const input = `${title} input`;
    await fillIn(input, newTitle);
    await click('.done');
  });

  test('rollover course to selected year', async function (assert) {
    assert.expect(5);
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old title',
      school,
      startDate: DateTime.fromObject({ hour: 0, minute: 0, second: 0 }).toJSDate(),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    const selectedYear = DateTime.now().plus({ year: 2 }).year;
    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      const data = queryString.parse(request.requestBody);
      assert.ok('year' in data);
      assert.strictEqual(parseInt(data.year, 10), selectedYear);
      assert.strictEqual(data.newCourseTitle, course.title);
      assert.ok('newStartDate' in data);
      return this.serialize(
        schema.courses.create({
          id: 14,
          title: data.newCourseTitle,
          startDate: data.newStartDate,
          year: data.year,
        }),
      );
    });
    this.set('visit', (newCourse) => {
      assert.strictEqual(parseInt(newCourse.id, 10), 14);
    });
    await render(hbs`<CourseRollover
      @course={{this.course}}
      @visit={{this.visit}}
    />
`);
    await fillIn('[data-test-year]', selectedYear);

    await click('.done');
  });

  test('disable years when title already exists', async function (assert) {
    const title = 'to be rolled';
    const lastYear = DateTime.now().minus({ year: 1 }).year;
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title,
      school,
      year: lastYear - 1,
    });
    this.server.create('course', {
      id: 2,
      school,
      title,
      year: lastYear,
    });
    this.server.create('course', {
      id: 3,
      school,
      title,
      year: lastYear + 2,
    });

    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseRollover
      @course={{this.course}}
      @visit={{(noop)}}
    />
`);

    let options = findAll('select:nth-of-type(1) option');
    assert.ok(options[0].disabled);
    assert.notOk(options[1].disabled);
    assert.ok(options[2].disabled);
    assert.notOk(options[3].disabled);
    assert.notOk(options[4].disabled);

    await fillIn('[data-test-title]', 'new title');
    options = findAll('select:nth-of-type(1) option');
    assert.notOk(options[0].disabled);
    assert.notOk(options[1].disabled);
    assert.notOk(options[2].disabled);
    assert.notOk(options[3].disabled);
    assert.notOk(options[4].disabled);

    await fillIn('[data-test-title]', title + ' ');
    options = findAll('select:nth-of-type(1) option');
    assert.ok(options[0].disabled);
    assert.notOk(options[1].disabled);
    assert.ok(options[2].disabled);
    assert.notOk(options[3].disabled);
    assert.notOk(options[4].disabled);
  });

  test('rollover into same year with title changed #1342', async function (assert) {
    const thisYear = DateTime.now().year;

    const school = this.server.create('school');
    this.server.create('course', {
      id: 2,
      school,
      year: thisYear,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', 2);
    this.set('course', courseModel);
    await render(hbs`<CourseRollover
      @course={{this.course}}
      @visit={{(noop)}}
    />
`);
    assert.dom('[data-test-year] option:disabled').exists({ count: 1 });
    await fillIn('[data-test-title]', 'new title');
    assert.dom('[data-test-year] option:disabled').doesNotExist();
  });

  test('rollover course with new start date', async function (assert) {
    assert.expect(7);
    const lastYear = DateTime.now().year - 1;
    // ensure that rollover date and course start date fall on the same day of the week.
    const courseStartDate = DateTime.fromISO(`${lastYear}-W20-1`);
    const rolloverDate = courseStartDate.plus({ week: 1 });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
      startDate: courseStartDate.toFormat('yyyy-MM-dd'),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      const data = queryString.parse(request.requestBody);
      assert.ok('newStartDate' in data, 'A new start date was passed.');
      const newStartDate = DateTime.fromFormat(data.newStartDate, 'y-MM-dd');
      assert.ok(rolloverDate.hasSame(newStartDate, 'day'), 'New start date is rollover date.');
      return this.serialize(
        schema.courses.create({
          id: 14,
        }),
      );
    });
    await render(hbs`<CourseRollover
        @course={{this.course}}
        @visit={{(noop)}}
      />
    `);
    const advancedOptions = '.advanced-options';
    const startDate = `${advancedOptions} input:nth-of-type(1)`;
    await fillIn('[data-test-year]', courseStartDate.year);

    await click(startDate);
    const picker = find('[data-test-course-rollover-picker]')._flatpickr;
    assert.strictEqual(
      picker.currentYear,
      courseStartDate.year,
      'Selected year initialized to course start date year.',
    );
    assert.strictEqual(
      picker.currentMonth + 1, //zero indexed
      courseStartDate.month,
      'Selected month initialized to course start date month.',
    );
    picker.setDate(rolloverDate.toJSDate(), true);
    assert.strictEqual(
      picker.currentYear,
      rolloverDate.year,
      'Selected year changed to rollover date year.',
    );
    assert.strictEqual(
      picker.currentMonth + 1, //zero indexed
      rolloverDate.month,
      'Selected month changed to rollover date month.',
    );
    assert.strictEqual(
      picker.selectedDates[0].getDate(),
      rolloverDate.day,
      'Selected day changed to rollover date day.',
    );
    await click('.done');
  });

  test('rollover course prohibit non-matching day-of-week date selection', async function (assert) {
    assert.expect(4);
    const lastYear = DateTime.now().year - 1;
    // rollover date and course start date don't fall on the same day of the week.
    const courseStartDate = DateTime.fromISO(`${lastYear}-W20-1`);
    const rolloverDate = courseStartDate.plus({ week: 1 }).set({ weekday: 3 });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'test title',
      school,
      startDate: courseStartDate.toFormat('yyyy-MM-dd'),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      const data = queryString.parse(request.requestBody);
      assert.ok('newStartDate' in data, 'A new start date was passed.');
      const newStartDate = DateTime.fromFormat(data.newStartDate, 'y-MM-dd');

      assert.ok(
        courseStartDate.hasSame(newStartDate, 'day'),
        'New start date is course start date.',
      );
      return this.serialize(
        schema.courses.create({
          id: 14,
        }),
      );
    });

    await render(hbs`<CourseRollover
      @course={{this.course}}
      @visit={{(noop)}}
    />
`);
    const advancedOptions = '.advanced-options';
    const yearSelect = '.year-select select';
    const startDate = `${advancedOptions} input:nth-of-type(1)`;

    await fillIn(yearSelect, courseStartDate.year);
    await emberBlur(yearSelect);

    await click(startDate);
    const picker = find('[data-test-course-rollover-picker]')._flatpickr;
    picker.setDate(rolloverDate.toJSDate(), true);
    assert.strictEqual(
      picker.currentYear,
      courseStartDate.year,
      'Selected year initialized to course start date year.',
    );
    assert.strictEqual(
      picker.currentMonth + 1, //zero indexed
      courseStartDate.month,
      'Selected month initialized to course start date month.',
    );
    await click('.done');
  });

  /**
   * This tests wonky business logic where the targeted rollover start date gets adjusted to a date in the current year
   * if the given course has a start date in a former year.
   */
  test('rollover start date adjustment with former year course start date', async function (assert) {
    const courseStartDate = DateTime.fromObject({
      year: 2017,
      month: 1,
      day: 16,
      hour: 0,
      minute: 0,
    });
    const rolloverDate = DateTime.fromObject({
      hour: 0,
      minute: 0,
    }).set({ weekNumber: courseStartDate.weekNumber, weekday: courseStartDate.weekday });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      school,
      startDate: courseStartDate.toJSDate(),
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseRollover
      @course={{this.course}}
      @visit={{(noop)}}
    />
`);
    const advancedOptions = '.advanced-options';
    const yearSelect = '.year-select select';
    const startDate = `${advancedOptions} input:nth-of-type(1)`;

    await fillIn(yearSelect, rolloverDate.year);
    await emberBlur(yearSelect);

    await click(startDate);
    const picker = find('[data-test-course-rollover-picker]')._flatpickr;
    assert.strictEqual(
      picker.currentYear,
      rolloverDate.year,
      'Selected year initialized to this year.',
    );
    assert.strictEqual(
      picker.currentMonth + 1, //zero indexed
      rolloverDate.month,
      "Selected month initialized to this year's equivalent of course's start month.",
    );
  });

  test('rollover course with no offerings', async function (assert) {
    assert.expect(4);
    const school = this.server.create('school', {
      title: 'SOM',
    });
    this.server.create('course', {
      title: 'old course',
      school,
    });
    const course = await this.owner.lookup('service:store').findRecord('course', 1);
    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      const data = queryString.parse(request.requestBody, {
        parseBooleans: true,
      });
      assert.ok('skipOfferings' in data);
      assert.true(data.skipOfferings);
      return this.serialize(
        schema.courses.create({
          id: 14,
        }),
      );
    });

    this.set('course', course);
    await render(hbs`<CourseRollover
      @course={{this.course}}
      @visit={{(noop)}}
    />
`);
    const advancedOptions = '.advanced-options';
    const offerings = `${advancedOptions} [data-test-skip-offerings]`;

    assert.dom(offerings).isChecked();
    await click(offerings);
    assert.dom(offerings).isNotChecked();
    await click('.done');
  });

  test('errors do not show up initially', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', {
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseRollover @course={{this.course}} />
`);
    assert.dom('.validation-error-message').doesNotExist();
  });

  test('errors show up', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', {
      school,
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseRollover @course={{this.course}} />
`);

    const title = '.title';
    const input = `${title} input`;

    await fillIn(input, '');
    assert.dom('.validation-error-message').exists({ count: 1 });
    assert.ok(find('.validation-error-message').textContent.includes('blank'));
  });

  test('rollover course with cohorts', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school', {
      title: 'SOM',
    });
    const program = this.server.create('program', {
      title: 'SOM',
      school,
    });
    const programYear = this.server.create('programYear', {
      program,
      published: true,
      archived: false,
    });
    this.server.create('cohort', {
      programYear,
    });
    this.server.create('course', {
      title: 'old course',
      school,
    });
    const course = await this.owner.lookup('service:store').findRecord('course', 1);
    this.server.post(`/api/courses/${course.id}/rollover`, function (schema, request) {
      const data = queryString.parse(request.requestBody, {
        arrayFormat: 'bracket',
      });
      assert.ok('newCohorts' in data);
      assert.deepEqual(data.newCohorts, ['1']);
      return this.serialize(
        schema.courses.create({
          id: 14,
        }),
      );
    });

    const mockCurrentUser = EmberObject.create({});

    const currentUserMock = Service.extend({
      model: resolve(mockCurrentUser),
    });
    this.owner.register('service:currentUser', currentUserMock);

    this.set('course', course);
    await render(hbs`<CourseRollover
      @course={{this.course}}
      @visit={{(noop)}}
    />
`);
    const advancedOptions = '.advanced-options';
    const firstCohort = `${advancedOptions} .selectable-cohorts li:nth-of-type(1) button`;

    await click(firstCohort);
    await click('.done');
  });
});
