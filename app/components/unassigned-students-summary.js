import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';

export default class UnassignedStudentsSummaryComponent extends Component {
  @service currentUser;
  @service store;

  @tracked schoolId;
  @tracked selectedSchool;
  @tracked unassignedStudents;

  get hasUnassignedStudents() {
    return this.unassignedStudents?.length > 0;
  }

  @restartableTask
  *load(element, [schoolId]) {
    if (schoolId) {
      this.selectedSchool = this.args.schools.findBy('id', schoolId);
    } else {
      const user = yield this.currentUser.getModel();
      this.selectedSchool = yield user.school;
    }
    this.unassignedStudents = yield this.store.query('user', {
      filters: {
        cohorts: null,
        enabled: true,
        roles: [4],
        school: this.selectedSchool.id,
      },
    });
  }
}
