import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { restartableTask, timeout } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { TrackedAsyncData } from 'ember-async-data';
import { DateTime } from 'luxon';
import { filterBy, sortBy, uniqueById } from 'ilios-common/utils/array-helpers';

const DEBOUNCE_DELAY = 250;

export default class DashboardMaterialsComponent extends Component {
  daysInAdvance = 60;
  @service store;
  @service fetch;
  @service iliosConfig;
  @tracked showAllMaterials = false;
  @service currentUser;
  @use _course = new AsyncProcess(() => [this.loadCourse.bind(this), this.args.courseIdFilter]);
  @use _materials = new AsyncProcess(() => [
    this.loadMaterials.bind(this),
    this.args.showAllMaterials,
  ]);

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : null;
  }

  async loadMaterials() {
    const user = await this.currentUser.getModel();
    let url = `${this.iliosConfig.apiNameSpace}/usermaterials/${user.id}`;
    if (!this.args.showAllMaterials) {
      const now = DateTime.now();
      const from = now.set({ hour: 0, minute: 0 }).toUnixInteger();
      const to = now
        .set({ hour: 23, minute: 59 })
        .plus({ day: this.daysInAdvance })
        .toUnixInteger();
      url += `?before=${to}&after=${from}`;
    }
    const data = await this.fetch.getJsonFromApiHost(url);
    return data.userMaterials;
  }

  async loadCourse(courseId) {
    let course = null;
    try {
      course = await this.store.findRecord('course', courseId);
    } catch (e) {
      // eat the exception
    }
    return course;
  }

  get course() {
    if (this._course) {
      return this._course;
    }
    return null;
  }

  get courseLoaded() {
    return this._course !== undefined;
  }

  get materials() {
    if (this._materials) {
      return this._materials;
    }
    return [];
  }

  get materialsLoaded() {
    return this._materials !== undefined;
  }

  get canApplyCourseFilter() {
    if (isPresent(this.args.courseIdFilter)) {
      return this.materialsFilteredByCourse.length;
    }
    return true;
  }

  get materialsFilteredByCourse() {
    if (isPresent(this.args.courseIdFilter)) {
      return filterBy(this.materials, 'course', this.args.courseIdFilter);
    }
    return this.materials;
  }

  get allFilteredMaterials() {
    let materials = this.materialsFilteredByCourse;

    if (isPresent(this.args.filter)) {
      materials = materials.filter(({ courseTitle, instructors, sessionTitle, title }) => {
        let searchString = `${title} ${courseTitle} ${sessionTitle} `;

        if (isPresent(instructors)) {
          searchString += instructors.join(' ');
        }

        return searchString.toLowerCase().includes(this.args.filter.toLowerCase());
      });
    }

    const sortedMaterials = sortBy(materials, this.sortInfo.column);
    if (this.sortInfo.descending) {
      return sortedMaterials.reverse();
    }
    return sortedMaterials;
  }

  get sortInfo() {
    const parts = this.args.sortBy.split(':');
    const column = parts[0];
    const descending = parts.length > 1 && parts[1] === 'desc';

    return { column, descending, sortBy: this.args.sortBy };
  }

  get filteredMaterials() {
    if (this.args.limit >= this.total) {
      return this.allFilteredMaterials;
    }
    return this.allFilteredMaterials.slice(this.args.offset, this.args.offset + this.args.limit);
  }

  get total() {
    return this.allFilteredMaterials.length;
  }

  get courses() {
    if (!this.materials) {
      return [];
    }
    const arr = this.materials.map((material) => {
      return {
        id: material.course,
        title: material.courseTitle,
        externalId: material.courseExternalId,
        year: material.courseYear,
      };
    });

    return sortBy(uniqueById(arr), ['year', 'title']);
  }

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  @action
  sortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  changeCourseIdFilter(event) {
    this.args.setOffset(0);
    this.args.setCourseIdFilter(event.target.value);
  }

  setQuery = restartableTask(async (query) => {
    await timeout(DEBOUNCE_DELAY);
    this.args.setOffset(0);
    this.args.setFilter(query);
  });
}
