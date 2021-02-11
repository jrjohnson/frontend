import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { gt } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isBlank, isEmpty, isPresent } from '@ember/utils';
import { resolve } from 'rsvp';
import { task, timeout } from 'ember-concurrency';

export default Controller.extend({
  currentUser: service(),
  intl: service(),
  permissionChecker: service(),

  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter',
  },

  deletedProgram: null,
  newProgram: null,
  schoolId: null,
  showNewProgramForm: false,
  titleFilter: null,

  hasMoreThanOneSchool: gt('model.schools.length', 1),

  filteredPrograms: computed('titleFilter', 'programs.[]', async function () {
    const titleFilter = this.titleFilter;
    const title = isBlank(titleFilter) ? '' : titleFilter.trim().toLowerCase();

    const programs = await this.programs;
    let filteredPrograms;
    if (isEmpty(title)) {
      filteredPrograms = programs;
    } else {
      filteredPrograms = programs.filter((program) => {
        return (
          isPresent(program.get('title')) &&
          program.get('title').trim().toLowerCase().includes(title)
        );
      });
    }
    return filteredPrograms.sortBy('title');
  }),

  selectedSchool: computed(
    'model.primarySchool',
    'model.schools.[]',
    'primarySchool',
    'schoolId',
    function () {
      const schools = this.get('model.schools');
      const primarySchool = this.get('model.primarySchool');
      if (isPresent(this.schoolId)) {
        const schoolId = this.schoolId;
        const school = schools.findBy('id', schoolId);
        if (school) {
          return school;
        }
      }

      return primarySchool;
    }
  ),

  programs: computed('deletedProgram', 'newProgram', 'selectedSchool', 'store', async function () {
    const schoolId = this.selectedSchool.get('id');
    if (isEmpty(schoolId)) {
      return resolve([]);
    }

    return await this.store.query('program', {
      filters: {
        school: schoolId,
      },
    });
  }),

  canCreate: computed('selectedSchool', async function () {
    const permissionChecker = this.permissionChecker;
    const selectedSchool = this.selectedSchool;
    return permissionChecker.canCreateProgram(selectedSchool);
  }),

  actions: {
    toggleEditor() {
      if (this.showNewProgramForm) {
        this.set('showNewProgramForm', false);
      } else {
        this.setProperties({ showNewProgramForm: true, newProgram: null });
      }
    },

    editProgram(program) {
      this.transitionToRoute('program', program);
    },

    async removeProgram(program) {
      const school = await this.selectedSchool;
      const programs = await school.get('programs');
      programs.removeObject(program);
      await program.destroyRecord();
      this.set('deletedProgram', program);
      const newProgram = this.newProgram;
      if (newProgram === program) {
        this.set('newProgram', null);
      }
    },

    async saveNewProgram(newProgram) {
      const school = await this.selectedSchool;
      const duration = 4;
      newProgram.setProperties({ school, duration });
      const savedProgram = await newProgram.save();
      this.set('showNewProgramForm', false);
      this.set('newProgram', savedProgram);
      const programs = await school.get('programs');
      programs.pushObject(savedProgram);
      return savedProgram;
    },

    cancel() {
      this.set('showNewProgramForm', false);
    },

    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },
  },

  changeTitleFilter: task(function* (value) {
    this.set('titleFilter', value);
    yield timeout(250);
    return value;
  }).restartable(),
});
