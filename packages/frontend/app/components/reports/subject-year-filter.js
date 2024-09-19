import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class ReportsSubjectYearFilter extends Component {
  @service reporting;
  @service store;

  @cached
  get allAcademicYearsData() {
    return new TrackedAsyncData(this.store.findAll('academic-year'));
  }

  get allAcademicYears() {
    return this.allAcademicYearsData.isResolved ? this.allAcademicYearsData.value : null;
  }

  get showAcademicYearFilter() {
    return (
      this.args.prepositionalObject !== 'course' &&
      this.args.prepositionalObject !== 'academic year' &&
      ['course', 'session'].includes(this.args.subject)
    );
  }
}
