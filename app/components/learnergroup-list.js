import Component from '@ember/component';

export default Component.extend({
  init(){
    this._super(...arguments);
    this.set('learnerGroupsForRemovalConfirmation', []);
    this.set('learnerGroupsForCopy', []);
  },
  learnerGroups: null,
  learnerGroupsForRemovalConfirmation: null,
  learnerGroupsForCopy: null,
  actions: {
    cancelRemove(learnerGroup) {
      this.get('learnerGroupsForRemovalConfirmation').removeObject(learnerGroup);
    },
    confirmRemove(learnerGroup) {
      this.get('learnerGroupsForRemovalConfirmation').pushObject(learnerGroup);
    },
    cancelCopy(learnerGroup) {
      this.get('learnerGroupsForCopy').removeObject(learnerGroup);
    },
    startCopy(learnerGroup) {
      this.get('learnerGroupsForCopy').pushObject(learnerGroup);
    },
    async copy(withLearners, learnerGroup) {
      const copy = this.get('copy');
      await copy(withLearners, learnerGroup);
      this.get('learnerGroupsForCopy').removeObject(learnerGroup);
    }
  }
});
