import Service, { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { singularize, pluralize } from 'ember-inflector';

const { filter, resolve, map } = RSVP;

export default Service.extend({
  store: service(),
  currentUser: service(),
  intl: service(),

  reportsList: computed('currentUser.model.reports.[]', async function () {
    const user = await this.currentUser.model;
    return isEmpty(user) ? [] : await user.reports;
  }),

  async findResults(report) {
    const store = this.store;
    const subject = report.subject;
    const object = report.prepositionalObject;
    const objectId = report.prepositionalObjectTableRowId;
    const school = await report.school;
    return store.query(this.getModel(subject), this.getQuery(subject, object, objectId, school));
  },

  async getResults(report, year) {
    const subject = report.subject;
    const results = await this.findResults(report);
    const mapper = pluralize(subject.camelize()) + 'Results';
    const mappedResults = await this[mapper](results, year);
    return mappedResults.sortBy('value');
  },

  async getArrayResults(report, year) {
    const subject = report.get('subject');

    const results = await this.findResults(report);
    const mapper = pluralize(subject.camelize()) + 'ArrayResults';
    return this[mapper](results, year);
  },

  getModel(subject) {
    let model = subject.dasherize();
    if (model === 'instructor') {
      model = 'user';
    }
    if (model === 'mesh-term') {
      model = 'mesh-descriptor';
    }

    return model;
  },

  getQuery(subject, object, objectId, school) {
    const query = {
      filters: {},
    };

    if (object && objectId) {
      let what = pluralize(object.camelize());
      if (object === 'mesh term') {
        what = 'meshDescriptors';
      }

      if (subject === 'session') {
        const sessionSingulars = ['sessionTypes', 'courses'];
        if (sessionSingulars.includes(what)) {
          what = singularize(what);
        }
      }
      if (subject === 'instructor') {
        const specialInstructed = ['learningMaterials', 'sessionTypes', 'courses', 'sessions'];
        if (specialInstructed.includes(what)) {
          what = 'instructed' + what.capitalize();
        }
      }
      if (subject === 'learning material' && object === 'course') {
        what = 'fullCourses';
      }
      query.filters[what] = objectId;
    } else {
      if (
        subject !== 'mesh term' &&
        subject !== 'instructor' &&
        subject !== 'learning material' &&
        school
      ) {
        query.filters['schools'] = [school.id];
      }
    }

    return query;
  },

  canViewCourses: computed('currentUser.performsNonLearnerFunction', async function () {
    const currentUser = this.currentUser;
    return currentUser.get('performsNonLearnerFunction');
  }),

  canViewPrograms: computed('currentUser.performsNonLearnerFunction', async function () {
    const currentUser = this.currentUser;
    return currentUser.get('performsNonLearnerFunction');
  }),

  async coursesResults(results, year) {
    const canView = await this.canViewCourses;
    const mappedResults = results.map((course) => {
      const rhett = {
        course,
      };
      rhett.value = course.get('academicYear') + ' ' + course.get('title');
      const externalId = course.get('externalId');
      if (isPresent(externalId)) {
        rhett.value += ` (${externalId})`;
      }
      if (canView) {
        rhett.route = 'course';
        rhett.model = course;
      }

      return rhett;
    });

    return mappedResults.filter(
      (obj) => isEmpty(year) || parseInt(obj.course.year, 10) === parseInt(year, 10)
    );
  },

  async coursesArrayResults(results, year) {
    const intl = this.intl;
    const filteredResults = results.filter((course) => {
      const academicYear = course.year;
      return isEmpty(year) || parseInt(academicYear, 10) === parseInt(year, 10);
    });
    const sortedResults = filteredResults.sortBy('title');
    const mappedResults = sortedResults.map((course) => {
      return [course.get('title'), course.get('academicYear'), course.get('externalId')];
    });

    return [
      [intl.t('general.courses'), intl.t('general.academicYear'), intl.t('general.externalId')],
    ].concat(mappedResults);
  },

  async sessionsResults(results, year) {
    const canView = await this.canViewCourses;
    const mappedResults = await map(results.toArray(), async (item) => {
      const course = await item.get('course');
      const rhett = { course };
      rhett.value =
        course.get('academicYear') + ' ' + course.get('title') + ' ' + item.get('title');
      if (canView) {
        rhett.route = 'session';
        rhett.model = course;
        rhett.model2 = item;
      }

      return rhett;
    });

    return mappedResults.filter(
      (obj) => isEmpty(year) || parseInt(obj.course.year, 10) === parseInt(year, 10)
    );
  },

  async sessionsArrayResults(results, year) {
    const intl = this.intl;
    const filteredResults = await filter(results.toArray(), async (session) => {
      const course = await session.course;
      const academicYear = course.year;
      return isEmpty(year) || parseInt(academicYear, 10) === parseInt(year, 10);
    });
    const sortedResults = filteredResults.sortBy('title');
    const mappedResults = await map(sortedResults, async (session) => {
      const course = await session.course;
      const sessionDescriptionText = session.textDescription;
      const objectives = await session.sessionObjectives;
      return [
        session.get('title'),
        course.get('title'),
        course.get('academicYear'),
        sessionDescriptionText,
        objectives.mapBy('textTitle').join(),
      ];
    });

    return [
      [
        intl.t('general.session'),
        intl.t('general.course'),
        intl.t('general.academicYear'),
        intl.t('general.description'),
        intl.t('general.objectives'),
      ],
    ].concat(mappedResults);
  },

  async programsResults(results) {
    const canView = await this.canViewPrograms;
    const mappedResults = await map(results.toArray(), async (item) => {
      const rhett = {};
      const school = await item.get('school');
      rhett.value = school.get('title') + ': ' + item.get('title');
      if (canView) {
        rhett.route = 'program';
        rhett.model = item;
      }
      return rhett;
    });

    return mappedResults;
  },

  async programsArrayResults(results) {
    const intl = this.intl;
    const sortedResults = results.sortBy('title');
    const mappedResults = await map(sortedResults.toArray(), async (program) => {
      const school = await program.get('school');
      return [program.get('title'), school.get('title')];
    });

    return [[intl.t('general.program'), intl.t('general.school')]].concat(mappedResults);
  },

  async programYearsResults(results) {
    const canView = await this.canViewPrograms;
    const mappedResults = await map(results.toArray(), async (item) => {
      const rhett = {};
      const program = await item.get('program');
      const school = await program.get('school');
      const classOfYear = await item.get('classOfYear');

      rhett.value = school.get('title') + ' ' + program.get('title') + ' ' + classOfYear;
      if (canView) {
        rhett.route = 'programYear';
        rhett.model = program;
        rhett.model2 = item;
      }
      return rhett;
    });

    return mappedResults;
  },

  async programYearsArrayResults(results) {
    const intl = this.intl;
    const resultsWithClassOfYear = await map(results, async (programYear) => {
      const classOfYear = await programYear.get('classOfYear');
      return {
        programYear,
        classOfYear,
      };
    });
    const sortedResults = resultsWithClassOfYear.sortBy('classOfYear');
    const mappedResults = await map(
      sortedResults.toArray(),
      async ({ programYear, classOfYear }) => {
        const program = await programYear.get('program');
        const school = await program.get('school');
        return [classOfYear, program.get('title'), school.get('title')];
      }
    );

    return [[intl.t('general.year'), intl.t('general.program'), intl.t('general.school')]].concat(
      mappedResults
    );
  },

  instructorsResults(results) {
    const mappedResults = results.map((result) => {
      return {
        value: result.get('fullName'),
      };
    });
    return resolve(mappedResults);
  },

  async instructorsArrayResults(results) {
    const intl = this.intl;
    const arr = await this.instructorsResults(results);
    const sortedResults = arr.sortBy('value');
    const mappedResults = sortedResults.map((obj) => [obj.value]);
    return [[intl.t('general.instructors')]].concat(mappedResults);
  },

  titleResults(results) {
    const mappedResults = results.map((result) => {
      return {
        value: result.get('title'),
      };
    });
    return resolve(mappedResults);
  },

  async valueResults(results, translationKey) {
    const intl = this.intl;
    const arr = await this.titleResults(results);
    const sortedResults = arr.sortBy('value');
    const mappedResults = sortedResults.map((obj) => [obj.value]);
    return [[intl.t(translationKey)]].concat(mappedResults);
  },

  instructorGroupsResults(results) {
    return this.titleResults(results);
  },

  async instructorGroupsArrayResults(results) {
    return this.valueResults(results, 'general.instructorGroups');
  },

  learningMaterialsResults(results) {
    return this.titleResults(results);
  },

  async learningMaterialsArrayResults(results) {
    return this.valueResults(results, 'general.learningMaterials');
  },

  competenciesResults(results) {
    return this.titleResults(results);
  },

  async competenciesArrayResults(results) {
    return this.valueResults(results, 'general.competencies');
  },

  sessionTypesResults(results) {
    return this.titleResults(results);
  },

  async sessionTypesArrayResults(results) {
    return this.valueResults(results, 'general.sessionTypes');
  },

  meshTermsResults(results) {
    const mappedResults = results.map((result) => {
      return {
        value: result.get('name'),
      };
    });
    return resolve(mappedResults);
  },

  async meshTermsArrayResults(results) {
    const intl = this.intl;
    const arr = await this.meshTermsResults(results);
    const sortedResults = arr.sortBy('value');
    const mappedResults = sortedResults.map((obj) => [obj.value]);
    return [[intl.t('general.meshTerms')]].concat(mappedResults);
  },

  async termsResults(results) {
    return map(results.toArray(), async (term) => {
      const vocabulary = await term.get('vocabulary');
      const titleWithParentTitles = await term.get('titleWithParentTitles');
      const value = vocabulary.get('title') + ' > ' + titleWithParentTitles;
      return { value };
    });
  },

  async termsArrayResults(results) {
    const intl = this.intl;
    const arr = await this.termsResults(results);
    const sortedResults = arr.sortBy('value');
    const mappedResults = sortedResults.map((obj) => [obj.value]);
    return [[intl.t('general.vocabulary')]].concat(mappedResults);
  },
});
