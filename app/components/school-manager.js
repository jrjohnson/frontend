import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class SchoolManagerComponent extends Component {
  @service flashMessages;
  @tracked @NotBlank() @Length(1, 60) title;

  @action
  load() {
    this.title = this.args.school.title;
  }

  @cached
  get institutionData() {
    return new TrackedAsyncData(this.args.school.curriculumInventoryInstitution);
  }

  get institutionLoaded() {
    return this.institutionData.isResolved;
  }

  get institution() {
    return this.institutionData.isResolved ? this.institutionData.value : null;
  }

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.args.school.sessionTypes);
  }

  get sessionTypesLoaded() {
    return this.sessionTypesData.isResolved;
  }

  get hasSessionTypes() {
    return this.sessionTypesData.isResolved ? !!this.sessionTypesData.value.length : false;
  }

  @dropTask
  *changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');

    this.args.school.title = this.title;
    this.newSchool = yield this.args.school.save();
    this.flashMessages.success('general.savedSuccessfully');
  }

  @action
  revertTitleChanges() {
    this.title = this.args.school.title;
  }

  @action
  async saveInstitution(institution) {
    if (!institution.belongsTo('school').id()) {
      institution.school = this.args.school;
    }
    await institution.save();
  }
}
