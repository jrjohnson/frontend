import Component from '@ember/component';
import ArrayProxy from '@ember/array/proxy';
import { computed } from '@ember/object';
import { gt } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';

export default Component.extend({
  currentUser: service(),
  store: service(),

  classNameBindings: [':pending-updates-summary', ':small-component', 'alert'],

  'data-test-pending-updates-summary': true,

  schoolId: null,
  schools: null,

  alert: gt('_updatesProxy.length', 0),

  selectedSchool: computed('currentUser', 'schoolId', 'schools', async function () {
    const schools = this.schools;
    const currentUser = this.currentUser;
    const schoolId = this.schoolId;

    if (schoolId) {
      return schools.findBy('id', schoolId);
    }
    const user = await currentUser.get('model');
    const school = await user.get('school');
    const defaultSchool = schools.findBy('id', school.get('id'));
    if (defaultSchool) {
      return defaultSchool;
    }

    return schools.get('firstObject');
  }),

  /**
   * Create a proxy object to drive the alerts CP.  This is hopefully a temporary
   * way to address this problem of needed the value of a promise to drive a computed property
   *
   * @todo We might be able to use https://github.com/kellyselden/ember-awesome-macros/pull/260 to get the Promise
   * results and use those in the alert CP.  JJ 3/2017
   *
   * @property updates
   * @type {Ember.computed}
   * @private
   */
  _updatesProxy: computed('updates', function () {
    const ArrayPromiseProxy = ArrayProxy.extend(PromiseProxyMixin);
    return ArrayPromiseProxy.create({
      promise: this.updates,
    });
  }),

  /**
   * A list of pending user updates.
   * @property updates
   * @type {Ember.computed}
   * @public
   */
  updates: computed('selectedSchool', async function () {
    const store = this.store;
    const school = await this.selectedSchool;
    const updates = await store.query('pending-user-update', {
      filters: {
        schools: [school.get('id')],
      },
    });

    return updates;
  }),

  init() {
    this._super(...arguments);
    this.set('sortSchoolsBy', ['title']);
  },

  actions: {
    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },
  },
});
