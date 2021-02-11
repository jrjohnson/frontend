import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class UserProfileRolesComponent extends Component {
  @service store;
  @service currentUser;
  @tracked hasSavedRecently = false;
  @tracked isEnabledFlipped = false;
  @tracked isFormerStudentFlipped = false;
  @tracked isStudentFlipped = false;
  @tracked isUserSyncIgnoredFlipped = false;
  @tracked roleTitles = [];

  @restartableTask
  *load() {
    const roles = yield this.args.user.roles;
    this.roleTitles = roles.map((role) => role.title.toLowerCase());
  }

  get isStudent() {
    const originallyYes = this.roleTitles.includes('student');
    return (originallyYes && !this.isStudentFlipped) || (!originallyYes && this.isStudentFlipped);
  }

  get isFormerStudent() {
    const originallyYes = this.roleTitles.includes('former student');
    return (
      (originallyYes && !this.isFormerStudentFlipped) ||
      (!originallyYes && this.isFormerStudentFlipped)
    );
  }

  get isEnabled() {
    const originallyYes = this.args.user.get('enabled');
    return (originallyYes && !this.isEnabledFlipped) || (!originallyYes && this.isEnabledFlipped);
  }

  get isUserSyncIgnored() {
    const originallyYes = this.args.user.get('userSyncIgnore');
    return (
      (originallyYes && !this.isUserSyncIgnoredFlipped) ||
      (!originallyYes && this.isUserSyncIgnoredFlipped)
    );
  }
  @action
  cancel() {
    this.resetFlipped();
    this.args.setIsManaging(false);
  }

  resetFlipped() {
    this.isStudentFlipped = false;
    this.isFormerStudentFlipped = false;
    this.isEnabledFlipped = false;
    this.isUserSyncIgnoredFlipped = false;
  }

  @dropTask
  *save() {
    const roles = yield this.store.findAll('user-role');
    const studentRole = roles.findBy('title', 'Student');
    const formerStudentRole = roles.findBy('title', 'Former Student');
    this.args.user.set('enabled', this.isEnabled);
    this.args.user.set('userSyncIgnore', this.isUserSyncIgnored);
    const userRoles = yield this.args.user.get('roles');
    userRoles.clear();
    if (this.isStudent) {
      userRoles.pushObject(studentRole);
    }
    if (this.isFormerStudent) {
      userRoles.pushObject(formerStudentRole);
    }
    this.resetFlipped();
    yield this.args.user.save();
    this.args.setIsManaging(false);
    this.hasSavedRecently = true;
    yield timeout(500);
    this.hasSavedRecently = false;
  }
}
