import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { timeout, waitForProperty } from 'ember-concurrency';
import { action } from '@ember/object';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { filter, map } from 'rsvp';
import { tracked } from '@glimmer/tracking';

export default class UserProfileCohortsComponent extends Component {
  @service currentUser;
  @service permissionChecker;

  @service store;

  @tracked hasSavedRecently = false;
  @tracked primaryCohort;
  @tracked schools = [];
  @tracked allCohortsWithRelationships = [];
  @tracked selectedCohorts = [];
  @tracked selectedSchoolId;

  get selectedSchool() {
    return this.schools.findBy('id', this.selectedSchoolId);
  }

  get assignableCohorts() {
    return this.allCohortsWithRelationships.filter(
      (obj) => !this.selectedCohorts.includes(obj.cohort)
    );
  }

  get assignableCohortsForSelectedSchool() {
    return this.assignableCohorts.filter((obj) => {
      return obj.school.id === this.selectedSchoolId;
    });
  }

  get secondaryCohorts() {
    if (!this.primaryCohort) {
      return this.selectedCohorts;
    }

    return this.selectedCohorts.filter((cohort) => {
      return cohort.id != this.primaryCohort.id;
    });
  }

  @action
  addSelectedCohort(cohort) {
    this.selectedCohorts = [...this.selectedCohorts, cohort];
  }
  @action
  removeSelectedCohort(cohort) {
    this.selectedCohorts = this.selectedCohorts.filter(({ id }) => id !== cohort.id);
  }

  @restartableTask
  *load(element, [user]) {
    yield waitForProperty(user, 'isLoaded'); //wait for promise to resolve because save() task modifies this relationship
    this.selectedCohorts = (yield user.cohorts).toArray();
    this.primaryCohort = yield user.primaryCohort;

    const sessionUser = yield this.currentUser.getModel();
    this.selectedSchoolId = (yield sessionUser.school).id;

    const allCohorts = (yield this.store.findAll('cohort')).toArray();
    this.allCohortsWithRelationships = yield map(allCohorts, async (cohort) => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const school = await program.school;

      return {
        cohort,
        programYear,
        program,
        school,
      };
    });
    const allSchools = (yield this.store.findAll('school')).toArray();
    this.schools = yield filter(allSchools, async (school) => {
      return this.permissionChecker.canUpdateUserInSchool(school);
    });
  }

  @dropTask
  *save() {
    yield waitForProperty(this, 'load.performCount');
    this.args.user.set('primaryCohort', this.primaryCohort);
    this.args.user.set('cohorts', this.selectedCohorts);

    yield this.args.user.save();
    this.args.setIsManaging(false);
    this.hasSavedRecently = true;
    yield timeout(500);
    this.hasSavedRecently = false;
  }
}
