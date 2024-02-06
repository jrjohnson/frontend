import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  reports: hasMany('report', { inverse: 'user' }),
  school: belongsTo('school', { inverse: null }),
  authentication: belongsTo('authentication', { inverse: 'user' }),
  directedCourses: hasMany('course', { inverse: 'directors' }),
  administeredCourses: hasMany('course', { inverse: 'administrators' }),
  studentAdvisedCourses: hasMany('course', { inverse: 'studentAdvisors' }),
  studentAdvisedSessions: hasMany('session', { inverse: 'studentAdvisors' }),
  learnerGroups: hasMany('learner-group', { inverse: 'users' }),
  instructedLearnerGroups: hasMany('learner-group', { inverse: 'instructors' }),
  instructorGroups: hasMany('instructor-group', { inverse: 'users' }),
  instructorIlmSessions: hasMany('ilm-session', { inverse: 'instructors' }),
  learnerIlmSessions: hasMany('ilm-session', { inverse: 'learners' }),
  offerings: hasMany('offering', { inverse: 'learners' }),
  instructedOfferings: hasMany('offering', { inverse: 'instructors' }),
  programYears: hasMany('program-year', { inverse: 'directors' }),
  roles: hasMany('user-role', { inverse: null }),
  directedSchools: hasMany('school', { inverse: 'directors' }),
  administeredSchools: hasMany('school', { inverse: 'administrators' }),
  administeredSessions: hasMany('session', { inverse: 'administrators' }),
  directedPrograms: hasMany('program', { inverse: 'directors' }),
  cohorts: hasMany('cohort', { inverse: 'users' }),
  primaryCohort: belongsTo('cohort', { inverse: null }),
  pendingUserUpdates: hasMany('pending-user-update', { inverse: 'user' }),
  administeredCurriculumInventoryReports: hasMany('curriculum-inventory-report', {
    inverse: 'administrators',
  }),
  sessionMaterialStatuses: hasMany('user-session-material-status', { inverse: 'user' }),
});
