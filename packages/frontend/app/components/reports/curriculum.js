import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { ensureSafeComponent } from '@embroider/util';
import SessionObjectives from './curriculum/session-objectives';
import LearnerGroups from './curriculum/learner-groups';

export default class ReportsCurriculumComponent extends Component {
  @service store;
  @service graphql;
  @service router;
  @service intl;

  @tracked searchResults = null;
  @tracked reportResults = null;
  @tracked reportIsRunning = false;

  reportList = [
    { value: 'sessionObjectives', label: this.intl.t('general.sessionObjectives') },
    { value: 'learnerGroups', label: this.intl.t('general.learnerGroups') },
  ];

  get passedCourseIds() {
    return this.args.selectedCourseIds?.map(Number) ?? [];
  }

  get selectedReport() {
    return this.args.report ?? this.reportList[0].value;
  }

  @cached
  get allCourses() {
    return this.args.schools.reduce((all, school) => {
      const courses = school.years.reduce((arr, year) => {
        return [...arr, ...year.courses];
      }, []);
      return [...all, ...courses];
    }, []);
  }

  get selectedCourses() {
    return this.allCourses.filter((course) => this.passedCourseIds.includes(Number(course.id)));
  }

  get showCourseYears() {
    const years = this.selectedCourses.map(({ year }) => year);
    return years.some((year) => year !== years[0]);
  }

  get reportResultsComponent() {
    switch (this.selectedReport) {
      case 'sessionObjectives':
        return ensureSafeComponent(SessionObjectives, this);
      case 'learnerGroups':
        return ensureSafeComponent(LearnerGroups, this);
    }

    return false;
  }

  pickCourse = (id) => {
    this.args.setSelectedCourseIds([...this.passedCourseIds, id].sort());
  };

  removeCourse = (id) => {
    this.reportIsRunning = false;
    this.args.setSelectedCourseIds(this.passedCourseIds.filter((i) => i !== Number(id)).sort());
  };

  changeSelectedReport = ({ target }) => {
    this.reportIsRunning = false;
    this.args.setReport(target.value);
  };
}
