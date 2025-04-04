import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import YupValidations from 'ilios-common/classes/yup-validations';
import { number, string } from 'yup';
import { dropTask, timeout } from 'ember-concurrency';
import { DateTime } from 'luxon';
import { filterBy, mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class CourseRolloverComponent extends Component {
  @service fetch;
  @service store;
  @service flashMessages;
  @service iliosConfig;

  @tracked newTitle;
  @tracked selectedYear;
  @tracked years;
  @tracked selectedStartDate;
  @tracked skipOfferings = false;
  @tracked selectedCohorts = [];

  validations = new YupValidations(this, {
    title: string().min(3).max(200),
    year: number(),
  });

  constructor() {
    super(...arguments);
    let { month, year } = DateTime.now();
    year--; // start with the previous year
    if (month < 7) {
      // before July 1st (start of a new academic year) show the year before
      year--;
    }
    this.years = [];
    for (let i = 0; i < 6; i++) {
      this.years.push(year + i);
    }
  }

  get isNewTitleSet() {
    return this.newTitle !== undefined;
  }

  get title() {
    return this.isNewTitleSet ? this.newTitle : this.args.course.title;
  }

  get isYearSet() {
    return this.selectedYear !== undefined;
  }

  get year() {
    return this.isYearSet
      ? this.selectedYear
      : (this.years.find((year) => !this.unavailableYears.includes(year)) ?? this.years[0]);
  }

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  get isStartDateSet() {
    return this.selectedStartDate !== undefined;
  }

  get startDate() {
    return this.isStartDateSet ? this.selectedStartDate : this.args.course.startDate;
  }

  get allowedWeekdays() {
    return [DateTime.fromJSDate(this.args.course.startDate).weekday];
  }

  @cached
  get allCoursesData() {
    return new TrackedAsyncData(this.loadAllCourses(this.args.course));
  }

  get allCourses() {
    return this.allCoursesData.isResolved ? this.allCoursesData.value : [];
  }

  async loadAllCourses(course) {
    const school = course.belongsTo('school').id();
    return this.store.query('course', {
      filters: {
        school,
      },
    });
  }

  @action
  changeTitle(newTitle) {
    this.validations.addErrorDisplayFor('title');
    this.newTitle = newTitle;
  }
  @action
  addCohort(cohort) {
    this.selectedCohorts = [...this.selectedCohorts, cohort];
  }
  @action
  removeCohort(cohort) {
    this.selectedCohorts = this.selectedCohorts.filter((obj) => obj !== cohort);
  }

  @action
  changeStartDate(newStartDate) {
    // if a date is forced that isn't allowed
    this.selectedStartDate = newStartDate ? newStartDate : this.args.course.startDate;
  }

  save = dropTask(async () => {
    this.validations.addErrorDisplaysFor(['title', 'year']);
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    await timeout(1);
    const courseId = this.args.course.id;

    const selectedCohortIds = mapBy(this.selectedCohorts, 'id');

    const data = {
      year: this.year,
      newCourseTitle: this.title,
      newStartDate: DateTime.fromJSDate(this.selectedStartDate).toFormat('yyyy-LL-dd'),
    };

    if (this.skipOfferings) {
      data.skipOfferings = true;
    }
    if (selectedCohortIds && selectedCohortIds.length) {
      data.newCohorts = selectedCohortIds;
    }

    const newCoursesObj = await this.fetch.postQueryToApi(`courses/${courseId}/rollover`, data);

    this.flashMessages.success('general.courseRolloverSuccess');
    this.store.pushPayload(newCoursesObj);
    const newCourse = this.store.peekRecord('course', newCoursesObj.data.id);

    return this.args.visit(newCourse);
  });

  get unavailableYears() {
    const existingCoursesWithTitle = filterBy(this.allCourses, 'title', this.title.trim());
    return mapBy(existingCoursesWithTitle, 'year');
  }

  @action
  setSelectedYear(event) {
    this.changeSelectedYear(event.target.value);
  }

  @action
  changeSelectedYear(selectedYear) {
    this.validations.addErrorDisplayFor('year');
    this.selectedYear = Number(selectedYear);
    const from = DateTime.fromJSDate(this.args.course.startDate);
    const startDate = DateTime.fromObject({
      hour: 0,
      minute: 0,
      weekYear: Number(selectedYear),
      weekNumber: from.weekNumber,
      weekday: from.weekday,
    }).toJSDate();
    this.changeStartDate(startDate);
  }
}
