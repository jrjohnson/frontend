import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { map } from 'rsvp';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default Component.extend({
  flashMessages: service(),
  tagName: '',
  users: null,
  matchedGroups: null,
  learnerGroup: null,

  finalData: computed('users.[]', 'matchedGroups.[]', 'learnerGroup', function () {
    const users = this.users;
    const learnerGroup = this.learnerGroup;
    const matchedGroups = this.matchedGroups;
    return users.map((obj) => {
      let selectedGroup = learnerGroup;
      if (obj.subGroupName) {
        const match = matchedGroups.findBy('name', obj.subGroupName);
        if (match) {
          selectedGroup = match.group;
        }
      }
      return {
        user: obj.userRecord,
        learnerGroup: selectedGroup,
      };
    });
  }),

  save: task(function* () {
    yield timeout(10);
    const finalData = this.finalData;
    const done = this.done;
    const flashMessages = this.flashMessages;
    const treeGroups = yield map(finalData, async ({ learnerGroup, user }) => {
      return learnerGroup.addUserToGroupAndAllParents(user);
    });

    const flat = treeGroups.reduce((flattened, arr) => {
      return flattened.pushObjects(arr);
    }, []);

    const groupsToSave = flat.uniq();
    yield all(groupsToSave.invoke('save'));
    flashMessages.success('general.savedSuccessfully');
    done();
  }),
});
