import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { filter, hash } from 'rsvp';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';

export default class UserProfilePermissionsComponent extends Component {
  @service store;
  @tracked selectedSchool;
  @tracked selectedYearId;
  @tracked schoolCollapsed = true;
  @tracked programCollapsed = true;
  @tracked programYearCollapsed = true;
  @tracked courseCollapsed = true;
  @tracked sessionCollapsed = true;
  @tracked schools = [];
  @tracked academicYears = [];
  @tracked isDirectingSchool = false;
  @tracked isAdministeringSchool = false;

  @tracked directedPrograms = [];
  @tracked directedProgramYears = [];
  @tracked directedCourses = [];
  @tracked administeredCourses = [];
  @tracked instructedCourses = [];
  @tracked studentAdvisedCourses = [];
  @tracked administeredSessions = [];
  @tracked instructedSessions = [];
  @tracked studentAdvisedSessions = [];

  @restartableTask
  *load() {
    const map = yield hash({
      schools: this.store.findAll('school'),
      academicYears: this.store.findAll('academic-year'),
      defaultSchool: this.args.user.school,
    });

    this.schools = map.schools;
    this.academicYears = map.academicYears;

    let currentYear = Number(moment().format('YYYY'));
    const currentMonth = Number(moment().format('M'));
    if (currentMonth < 6) {
      currentYear--;
    }
    let selectedYear = this.academicYears.find((year) => Number(year.id) === currentYear);
    if (!selectedYear) {
      selectedYear = this.academicYears.get('lastObject');
    }
    this.selectedYearId = selectedYear?.id;
    if (map.defaultSchool) {
      yield this.changeSchool.perform(map.defaultSchool.id);
    } else if (this.schools.length) {
      yield this.changeSchool.perform(this.schools.sortBy('title')[0].id);
    }
  }

  @restartableTask
  *changeSchool(schoolId) {
    this.selectedSchool = this.schools.findBy('id', schoolId);
    this.isDirectingSchool = this.args.user.hasMany('directedSchools').ids().includes(schoolId);
    this.isAdministeringSchool = this.args.user
      .hasMany('administeredSchools')
      .ids()
      .includes(schoolId);
    const map = yield hash({
      directedPrograms: this.getDirectedPrograms(this.selectedSchool),
      directedProgramYears: this.getDirectedProgramYears(this.selectedSchool),
      directedCourses: this.getDirectedCourses(this.selectedSchool, this.selectedYearId),
      administeredCourses: this.getAdministeredCourses(this.selectedSchool, this.selectedYearId),
      instructedCourses: this.getInstructedCourses(this.selectedSchool, this.selectedYearId),
      studentAdvisedCourses: this.getStudentAdvisedCourses(
        this.selectedSchool,
        this.selectedYearId
      ),
      administeredSessions: this.getAdministeredSessions(this.selectedSchool, this.selectedYearId),
      instructedSessions: this.getInstructedSessions(this.selectedSchool, this.selectedYearId),
      studentAdvisedSessions: this.getStudentAdvisedSessions(
        this.selectedSchool,
        this.selectedYearId
      ),
    });
    this.directedPrograms = map.directedPrograms;
    this.directedProgramYears = map.directedProgramYears;
    this.directedCourses = map.directedCourses;
    this.administeredCourses = map.administeredCourses;
    this.instructedCourses = map.instructedCourses;
    this.studentAdvisedCourses = map.studentAdvisedCourses;
    this.administeredSessions = map.administeredSessions;
    this.instructedSessions = map.instructedSessions;
    this.studentAdvisedSessions = map.studentAdvisedSessions;
  }

  @restartableTask
  *changeYear(yearId) {
    this.selectedYearId = yearId;
    const map = yield hash({
      directedCourses: this.getDirectedCourses(this.selectedSchool, this.selectedYearId),
      administeredCourses: this.getAdministeredCourses(this.selectedSchool, this.selectedYearId),
      instructedCourses: this.getInstructedCourses(this.selectedSchool, this.selectedYearId),
      studentAdvisedCourses: this.getStudentAdvisedCourses(
        this.selectedSchool,
        this.selectedYearId
      ),
      administeredSessions: this.getAdministeredSessions(this.selectedSchool, this.selectedYearId),
      instructedSessions: this.getInstructedSessions(this.selectedSchool, this.selectedYearId),
      studentAdvisedSessions: this.getStudentAdvisedSessions(
        this.selectedSchool,
        this.selectedYearId
      ),
    });
    this.directedCourses = map.directedCourses;
    this.administeredCourses = map.administeredCourses;
    this.instructedCourses = map.instructedCourses;
    this.studentAdvisedCourses = map.studentAdvisedCourses;
    this.administeredSessions = map.administeredSessions;
    this.instructedSessions = map.instructedSessions;
    this.studentAdvisedSessions = map.studentAdvisedSessions;
  }

  get selectedYear() {
    return this.academicYears.findBy('id', this.selectedYearId);
  }

  async getDirectedPrograms(selectedSchool) {
    const directedPrograms = (await this.args.user.directedPrograms).toArray();

    return filter(directedPrograms, async (program) => {
      const school = await program.school;
      return school === selectedSchool;
    });
  }

  async getDirectedProgramYears(selectedSchool) {
    const directedProgramYears = (await this.args.user.programYears).toArray();

    return filter(directedProgramYears, async (programYear) => {
      const program = await programYear.program;
      const school = await program.school;
      return school === selectedSchool;
    });
  }

  async getDirectedCourses(selectedSchool, selectedYearId) {
    const directedCourses = (await this.args.user.directedCourses).toArray();

    return filter(directedCourses, async (course) => {
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getAdministeredCourses(selectedSchool, selectedYearId) {
    const administeredCourses = (await this.args.user.administeredCourses).toArray();

    return filter(administeredCourses, async (course) => {
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getInstructedCourses(selectedSchool, selectedYearId) {
    const allInstructedCourses = (await this.args.user.allInstructedCourses).toArray();

    return filter(allInstructedCourses, async (course) => {
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getStudentAdvisedCourses(selectedSchool, selectedYearId) {
    const studentAdvisedCourses = (await this.args.user.studentAdvisedCourses).toArray();

    return filter(studentAdvisedCourses, async (course) => {
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getAdministeredSessions(selectedSchool, selectedYearId) {
    const administeredSessions = (await this.args.user.administeredSessions).toArray();

    return filter(administeredSessions, async (session) => {
      const course = await session.course;
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getInstructedSessions(selectedSchool, selectedYearId) {
    const allInstructedSessions = (await this.args.user.allInstructedSessions).toArray();

    return filter(allInstructedSessions, async (session) => {
      const course = await session.course;
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getStudentAdvisedSessions(selectedSchool, selectedYearId) {
    const studentAdvisedSessions = (await this.args.user.studentAdvisedSessions).toArray();

    return filter(studentAdvisedSessions, async (session) => {
      const course = await session.course;
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  get courseCount() {
    return (
      this.directedCourses.length +
      this.administeredCourses.length +
      this.instructedCourses.length +
      this.studentAdvisedCourses.length
    );
  }

  get sessionCount() {
    return (
      this.administeredSessions.length +
      this.instructedSessions.length +
      this.studentAdvisedSessions.length
    );
  }
}
