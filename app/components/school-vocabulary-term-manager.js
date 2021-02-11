import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { validatable, Custom, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';

@validatable
export default class SchoolVocabularyTermManagerComponent extends Component {
  @service store;
  @service flashMessages;
  @service intl;
  @tracked
  @NotBlank()
  @Length(1, 200)
  @Custom('validateTitleCallback', 'validateTitleMessageCallback')
  title;
  @tracked isActive = false;
  @tracked description;
  @tracked newTerm;
  @tracked termsRelationship;

  get terms() {
    if (this.termsRelationship) {
      return this.termsRelationship.sortBy('title');
    }
    return [];
  }

  @restartableTask
  *load() {
    this.newTerm = null;
    this.title = this.args.term.title;
    this.isActive = this.args.term.active;
    this.description = this.args.term.description;
    this.termsRelationship = yield this.args.term.children;
  }

  @dropTask
  *changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.term.title = this.title;
    return this.args.term.save();
  }

  @action
  revertTitleChanges() {
    this.removeErrorDisplayFor('title');
    this.title = this.args.term.title;
  }

  @dropTask
  *changeDescription() {
    this.args.term.set('description', this.description);
    yield this.args.term.save();
  }

  @action
  revertDescriptionChanges() {
    this.description = this.args.term.description;
  }

  @action
  async createTerm(title) {
    const term = this.store.createRecord('term', {
      title,
      parent: this.args.term,
      vocabulary: this.args.vocabulary,
      active: true,
    });
    this.newTerm = await term.save();
  }

  @dropTask
  *deleteTerm() {
    const parent = yield this.args.term.parent;
    const goTo = isEmpty(parent) ? null : parent.id;
    this.args.term.deleteRecord();
    if (parent) {
      const siblings = parent.children;
      siblings.removeObject(this.args.term);
    }
    yield this.args.term.save();
    this.args.manageTerm(goTo);
    this.flashMessages.success('general.successfullyRemovedTerm');
  }

  @action
  clearVocabAndTerm() {
    this.args.manageVocabulary(null);
    this.args.manageTerm(null);
  }

  @dropTask
  *changeIsActive(isActive) {
    this.args.term.active = isActive;
    yield this.args.term.save();
    this.isActive = this.args.term.active;
  }

  async validateTitleCallback() {
    const terms = await this.args.term.children;
    return !terms.mapBy('title').includes(this.title);
  }

  validateTitleMessageCallback() {
    return this.intl.t('errors.exclusion', { description: this.intl.t('general.term') });
  }
}
