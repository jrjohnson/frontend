import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { Promise as RSVPPromise, map } from 'rsvp';
import { isEmpty, isPresent } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import PapaParse from 'papaparse';

export default Component.extend({
  store: service(),
  iliosConfig: service(),
  intl: service(),
  tagName: '',
  file: null,
  data: null,
  learnerGroup: null,

  sampleData: computed(function () {
    const sampleUploadFields = ['First', 'Last', 'CampusID', 'Sub Group Name'];

    const str = sampleUploadFields.join('\t');
    const encoded = window.btoa(str);

    return encoded;
  }),

  validUsers: computed('data.[]', function () {
    const data = this.data;
    if (!data) {
      return [];
    }
    return data.filterBy('isValid');
  }),

  invalidUsers: computed('data.[]', function () {
    const data = this.data;
    if (!data) {
      return [];
    }
    return data.filter((obj) => !obj.isValid);
  }),

  matchedGroups: computed('data.[]', 'learnerGroup', async function () {
    const data = this.data;
    const learnerGroup = this.learnerGroup;
    if (!data) {
      return [];
    }
    const uploadedSubGroups = data
      .mapBy('subGroupName')
      .uniq()
      .filter((str) => isPresent(str));
    const groups = await learnerGroup.get('allDescendants');
    const matchObjects = uploadedSubGroups.map((groupName) => {
      const group = groups.findBy('title', groupName);
      return EmberObject.create({
        name: groupName,
        group,
      });
    });
    return matchObjects.filter((obj) => isPresent(obj.get('group')));
  }),

  init() {
    this._super(...arguments);
    this.set('data', []);
  },

  actions: {
    async updateSelectedFile(files) {
      // Check for the various File API support.
      if (window.File && window.FileReader && window.FileList && window.Blob) {
        if (files.length > 0) {
          await this.parseFile.perform(files[0]);
        }
      } else {
        throw new Error('This browser is not supported');
      }
    },
  },

  parseFile: task(function* (file) {
    const store = this.store;
    const intl = this.intl;
    const learnerGroup = this.learnerGroup;
    const cohort = yield learnerGroup.get('cohort');
    const proposedUsers = yield this.getFileContents(file);
    const data = yield map(
      proposedUsers,
      async ({ firstName, lastName, campusId, subGroupName }) => {
        const errors = [];
        const warnings = [];
        if (isEmpty(firstName)) {
          errors.push(intl.t('errors.required', { description: intl.t('general.firstName') }));
        }
        if (isEmpty(lastName)) {
          errors.push(intl.t('errors.required', { description: intl.t('general.lastName') }));
        }
        if (isEmpty(campusId)) {
          errors.push(intl.t('errors.required', { description: intl.t('general.campusId') }));
        }
        let userRecord = null;
        if (errors.length === 0) {
          const users = await store.query('user', {
            filters: {
              campusId,
              enabled: true,
            },
          });
          if (users.get('length') === 0) {
            errors.push(intl.t('general.couldNotFindUserCampusId', { campusId }));
          } else if (users.get('length') > 1) {
            errors.push(intl.t('general.multipleUsersFoundWithCampusId', { campusId }));
          } else {
            const user = users.get('firstObject');
            const cohorts = await user.get('cohorts');
            const cohortIds = cohorts.mapBy('id');
            if (!cohortIds.includes(cohort.get('id'))) {
              errors.push(
                intl.t('general.userNotInGroupCohort', { cohortTitle: cohort.get('title') })
              );
            }
            if (user.get('firstName') != firstName) {
              warnings.push(
                intl.t('general.doesNotMatchUserRecord', {
                  description: intl.t('general.firstName'),
                  record: user.get('firstName'),
                })
              );
            }
            if (user.get('lastName') != lastName) {
              warnings.push(
                intl.t('general.doesNotMatchUserRecord', {
                  description: intl.t('general.lastName'),
                  record: user.get('lastName'),
                })
              );
            }

            const topLevelGroup = await learnerGroup.get('topLevelGroup');
            const allUsersInGroupHierarchy = await topLevelGroup.get('allDescendantUsers');
            if (allUsersInGroupHierarchy.includes(user)) {
              errors.push(
                intl.t('general.userExistsInGroupHierarchy', {
                  groupTitle: topLevelGroup.get('title'),
                })
              );
            }

            userRecord = user;
          }
        }

        return {
          firstName,
          lastName,
          campusId,
          subGroupName: typeof subGroupName === 'string' ? subGroupName.trim() : subGroupName,
          userRecord,
          errors,
          warning: warnings.join(', '),
          hasWarning: warnings.length > 0,
          isValid: errors.length === 0,
        };
      }
    );

    // flag duplicate users as such
    const campusIds = [];
    data.forEach((user) => {
      if (campusIds.includes(user.campusId)) {
        user.errors.push(intl.t('general.userExistsMultipleTimesInUpload'));
        user.isValid = false;
      } else {
        campusIds.push(user.campusId);
      }
    });

    this.set('data', data);
  }).restartable(),

  /**
   * Extract the contents of a file into an array of user like objects
   * @param Object file
   *
   * @return array
   **/
  getFileContents(file) {
    return new RSVPPromise((resolve) => {
      this.set('fileUploadError', false);
      const allowedFileTypes = ['text/plain', 'text/csv', 'text/tab-separated-values'];
      if (!allowedFileTypes.includes(file.type)) {
        this.set('fileUploadError', true);
        throw new Error(`Unable to accept files of type ${file.type}`);
      }

      const ProposedUser = EmberObject.extend({});
      const complete = ({ data }) => {
        const proposedUsers = data.map((arr) => {
          return ProposedUser.create({
            firstName: isPresent(arr[0]) ? arr[0] : null,
            lastName: isPresent(arr[1]) ? arr[1] : null,
            campusId: isPresent(arr[2]) ? arr[2] : null,
            subGroupName: isPresent(arr[3]) ? arr[3] : null,
          });
        });
        const notHeaderRow = proposedUsers.filter(
          (obj) =>
            String(obj.firstName).toLowerCase() !== 'first' ||
            String(obj.lastName).toLowerCase() !== 'last'
        );
        const skipEmpty = notHeaderRow.filter((obj) => {
          return !(
            isEmpty(obj.firstName) &&
            isEmpty(obj.lastName) &&
            isEmpty(obj.campusId) &&
            isEmpty(obj.subGroupName)
          );
        });

        resolve(skipEmpty);
      };

      PapaParse.parse(file, {
        complete,
        skipEmptyLines: true,
      });
    });
  },

  continue: task(function* () {
    yield timeout(10);
    const validUsers = this.validUsers;
    const matchedGroups = yield this.matchedGroups;
    const sendValidUsers = this.sendValidUsers;
    const sendMatchedGroups = this.sendMatchedGroups;
    sendValidUsers(validUsers);
    sendMatchedGroups(matchedGroups);
  }),
});
