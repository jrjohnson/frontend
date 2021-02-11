import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, fillIn, find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { setupIntl } from 'ember-intl/test-support';

const { resolve } = RSVP;

module('Integration | Component | curriculum inventory report overview', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function (assert) {
    assert.expect(13);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
    });

    const permissionCheckerMock = Service.extend({
      canCreateCurriculumInventoryReport() {
        return resolve(true);
      },
    });
    this.owner.register('service:permission-checker', permissionCheckerMock);
    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{true}} />`);
    assert.dom('.title').hasText('Overview', 'Component title is visible.');
    assert
      .dom('.report-overview-actions .verification-preview')
      .exists({ count: 1 }, 'Rollover course button is visible.');
    assert
      .dom('.report-overview-actions .rollover')
      .exists({ count: 1 }, 'Verification preview link is visible.');
    assert.dom('.start-date label').hasText('Start:', 'Start date label is correct.');
    assert
      .dom('.start-date .editinplace')
      .hasText(this.intl.formatDate(report.startDate), 'Start date is visible.');
    assert.dom('.end-date label').hasText('End:', 'End date label is correct.');
    assert
      .dom('.end-date .editinplace')
      .hasText(this.intl.formatDate(report.endDate), 'End date is visible.');
    assert.dom('.academic-year label').hasText('Academic Year:', 'Academic year label is correct.');
    assert
      .dom('.academic-year .editinplace')
      .hasText(
        report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1),
        'Academic year is visible.'
      );
    assert.dom('.program label').hasText('Program:', 'Program label is correct.');
    assert
      .dom('.program > span')
      .hasText(`${program.get('title')} (${program.get('shortTitle')})`, 'Program is visible.');

    assert.dom('.description label').hasText('Description:', 'Description label is correct.');
    assert
      .dom('.description .editinplace')
      .hasText(report.get('description'), 'Description is visible.');
  });

  test('read-only', async function (assert) {
    assert.expect(5);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
    });

    this.set('report', report);

    await render(
      hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{false}} />`
    );

    return settled().then(() => {
      assert
        .dom('.start-date > span')
        .hasText(this.intl.formatDate(report.startDate), 'Start date is visible.');
      assert
        .dom('.end-date > span')
        .hasText(this.intl.formatDate(report.endDate), 'End date is visible.');
      assert
        .dom('.academic-year > span')
        .hasText(
          report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1),
          'Academic year is visible.'
        );
      assert
        .dom('.program > span')
        .hasText(`${program.get('title')} (${program.get('shortTitle')})`, 'Program is visible.');
      assert
        .dom('.description > span')
        .hasText(report.get('description'), 'Description is visible.');
    });
  });

  test('rollover button not visible for unprivileged user', async function (assert) {
    assert.expect(1);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: true,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
    });

    const permissionCheckerMock = Service.extend({
      canCreateCurriculumInventoryReport() {
        return resolve(false);
      },
    });
    this.owner.register('service:permission-checker', permissionCheckerMock);
    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{true}} />`);

    return settled().then(() => {
      assert
        .dom('.report-overview-actions .rollover')
        .doesNotExist('Rollover course button is not visible.');
    });
  });

  test('change start date', async function (assert) {
    assert.expect(3);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
      hasLinkedCourses: resolve(true),
      save() {
        return resolve(this);
      },
    });

    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{true}} />`);
    await click('.start-date .editinplace .editable');
    assert
      .dom('.start-date input')
      .hasValue(
        this.intl.formatDate(report.startDate),
        "The report's current start date is pre-selected in date picker."
      );
    const newVal = moment('2015-04-01');
    await click('.start-date input');
    const picker = find('[data-test-start-date-picker]')._flatpickr;
    picker.setDate(newVal.toDate(), true);
    await click('.start-date .actions .done');
    assert
      .dom('.start-date .editinplace')
      .hasText(this.intl.formatDate(newVal), 'Edit link shown new start date post-update.');
    assert.equal(
      this.intl.formatDate(report.startDate),
      this.intl.formatDate(newVal),
      "The report's start date was updated."
    );
  });

  test('validation fails if given start date follows end date', async function (assert) {
    assert.expect(2);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
      hasLinkedCourses: resolve(true),
    });

    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{true}} />`);
    return settled().then(async () => {
      await click('.start-date .editinplace .editable');
      await click('.start-date input');
      const newVal = moment(report.get('endDate')).add(1, 'day');
      const picker = find('[data-test-start-date-picker]')._flatpickr;
      picker.setDate(newVal.toDate(), true);
      assert
        .dom('.start-date .validation-error-message')
        .doesNotExist('Initially, no validation error is visible.');
      await click('.start-date .actions .done');
      assert
        .dom('.start-date .validation-error-message')
        .exists({ count: 1 }, 'Validation failed, error message is visible.');
    });
  });

  test('change end date', async function (assert) {
    assert.expect(3);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
      hasLinkedCourses: resolve(true),
      save() {
        return resolve(this);
      },
    });

    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{true}} />`);
    await click('.end-date .editinplace .editable');
    await click('.end-date input');
    assert
      .dom('.end-date input')
      .hasValue(
        this.intl.formatDate(report.endDate),
        "The report's current end date is pre-selected in date picker."
      );
    const newVal = moment('2016-05-01');
    const picker = find('[data-test-end-date-picker]')._flatpickr;
    picker.setDate(newVal.toDate(), true);
    await click('.end-date .actions .done');
    assert
      .dom('.end-date .editinplace')
      .hasText(this.intl.formatDate(newVal), 'Edit link shown new end date post-update.');
    assert.equal(
      moment(report.get('endDate')).format('YYYY-MM-DD'),
      newVal.format('YYYY-MM-DD'),
      "The report's end date was updated."
    );
  });

  test('validation fails if given end date precedes end date', async function (assert) {
    assert.expect(2);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
      hasLinkedCourses: resolve(true),
    });

    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{true}} />`);
    await click('.end-date .editinplace .editable');
    await click('.end-date input');
    const newVal = moment(report.get('startDate')).subtract(1, 'day');
    const picker = find('[data-test-end-date-picker]')._flatpickr;
    picker.setDate(newVal.toDate(), true);
    assert
      .dom('.end-date .validation-error-message')
      .doesNotExist('Initially, no validation error is visible.');
    await click('.end-date .actions .done');
    assert
      .dom('.end-date .validation-error-message')
      .exists({ count: 1 }, 'Validation failed, error message is visible.');
  });

  test('change academic year', async function (assert) {
    assert.expect(4);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: parseInt(moment().format('YYYY'), 10),
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      sequenceBlocks: resolve([]),
      description: null,
      save() {
        return resolve(this);
      },
    });

    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{true}} />`);
    return settled().then(async () => {
      await click('.academic-year .editinplace .editable');
      return settled().then(async () => {
        assert
          .dom('.academic-year option')
          .exists({ count: 11 }, 'There should be ten options in year dropdown.');
        assert
          .dom('.academic-year option:checked')
          .hasValue(report.get('year').toString(), "The report's year should be selected.");
        const newVal = report.get('year') + 1;
        await fillIn('.academic-year select', newVal);
        await click('.academic-year .actions .done');
        return settled().then(() => {
          assert
            .dom('.academic-year .editinplace')
            .hasText(`${newVal} - ${newVal + 1}`, 'New year is visible on edit-link.');
          assert.equal(
            report.get('year'),
            newVal.toString(),
            'Report year got updated with new value.'
          );
        });
      });
    });
  });

  test('academic year unchangeable if course has been linked', async function (assert) {
    assert.expect(2);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
      hasLinkedCourses: resolve(true),
    });

    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{true}} />`);
    return settled().then(() => {
      assert
        .dom('.academic-year > span')
        .hasText(
          report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1),
          'Academic year is visible.'
        );
      assert
        .dom('.academic-year .editinplace')
        .doesNotExist('Academic year is not editable in place.');
    });
  });

  test('change description', async function (assert) {
    assert.expect(3);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      sequenceBlocks: resolve([]),
      description: null,
      save() {
        return resolve(this);
      },
    });

    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{true}} />`);
    return settled().then(async () => {
      assert.dom('.description .editinplace').hasText('Click to edit');
      await click('.description .editinplace .editable');
      return settled().then(async () => {
        const newDescription = 'Quidquid luce fuit, tenebris agit.';
        await fillIn('.description textarea', newDescription);
        await click('.description .actions .done');
        return settled().then(() => {
          assert.dom('.description .editinplace').hasText(newDescription);
          assert.equal(report.get('description'), newDescription);
        });
      });
    });
  });

  test('description validation fails if text is too long', async function (assert) {
    assert.expect(3);

    const school = EmberObject.create({
      id() {
        return 1;
      },
    });

    const academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    const program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS',
    });

    const report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      sequenceBlocks: resolve([]),
      description: null,
    });

    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportOverview @report={{report}} @canUpdate={{true}} />`);
    return settled().then(async () => {
      assert.dom('.description .editinplace').hasText('Click to edit');
      await click('.description .editinplace .editable');
      return settled().then(async () => {
        assert
          .dom('.description .validation-error-message')
          .doesNotExist('Validation error is initially not shown.');
        const newDescription = '0123456789'.repeat(5000);
        await fillIn('.description textarea', newDescription);
        await click('.description .actions .done');
        return settled().then(() => {
          assert
            .dom('.description .validation-error-message')
            .exists({ count: 1 }, 'Validation error message is visible.');
        });
      });
    });
  });
});
