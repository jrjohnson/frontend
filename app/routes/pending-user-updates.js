import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { filter } from 'rsvp';

export default class PendingUserUpdatesRoute extends Route {
  @service currentUser;
  @service permissionChecker;
  @service store;
  @service session;

  queryParams = {
    filter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const currentUser = this.currentUser;
    const store = this.store;
    const permissionChecker = this.permissionChecker;
    const allSchools = await store.findAll('school');
    const schools = await filter(allSchools.toArray(), async (school) => {
      return permissionChecker.canUpdateUserInSchool(school);
    });
    const user = await currentUser.get('model');
    const primarySchool = await user.get('school');
    return { primarySchool, schools };
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('deletedUpdates', []);
    controller.set('sortSchoolsBy', ['title']);
    controller.set('updatesBeingSaved', []);
  }
}
