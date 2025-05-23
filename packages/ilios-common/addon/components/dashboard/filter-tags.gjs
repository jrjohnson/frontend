import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';

export default class DashboardFilterTagsComponent extends Component {
  @service store;
  @service intl;

  get activeFilters() {
    return [].concat(
      this.args.selectedSessionTypeIds || [],
      this.args.selectedCourseLevels || [],
      this.args.selectedCohortIds || [],
      this.args.selectedCourseIds || [],
      this.args.selectedTermIds || [],
    );
  }

  get filterTags() {
    return [
      ...this.courseLevelTags,
      ...this.sessionTypeTags,
      ...this.cohortTags,
      ...this.termTags,
      ...this.courseTags,
    ];
  }

  async fetchModel(modelName, id) {
    const model = this.store.peekRecord(modelName, id);
    return model ? model : this.store.findRecord(modelName, id);
  }

  get courseLevelTags() {
    return this.args.selectedCourseLevels.map((level) => {
      return {
        id: level,
        class: 'tag-course-level',
        remove: this.args.removeCourseLevel,
        name: this.intl.t('general.courseLevel', { level }),
      };
    });
  }

  @cached
  get sessionTypeTagsData() {
    return new TrackedAsyncData(
      Promise.all(
        this.args.selectedSessionTypeIds.map(async (id) => {
          const sessionType = await this.fetchModel('session-type', id);
          return {
            id,
            class: 'tag-session-type',
            remove: this.args.removeSessionTypeId,
            name: sessionType.title,
          };
        }),
      ),
    );
  }

  get sessionTypeTags() {
    return this.sessionTypeTagsData.isResolved ? this.sessionTypeTagsData.value : [];
  }

  get cohortTags() {
    return this.args.selectedCohortIds.map((id) => {
      const proxy = findById(this.args.cohortProxies, id);
      return {
        id,
        class: 'tag-cohort',
        remove: this.args.removeCohortId,
        name: `${proxy.displayTitle} ${proxy.programTitle}`,
      };
    });
  }

  @cached
  get termTagsData() {
    return new TrackedAsyncData(
      Promise.all(
        this.args.selectedTermIds.map(async (id) => {
          const term = await this.fetchModel('term', id);
          const allTitles = await term.getTitleWithParentTitles();
          const vocabulary = await term.vocabulary;
          const title = vocabulary.get('title');
          return {
            id,
            class: 'tag-term',
            remove: this.args.removeTermId,
            name: `${title} > ${allTitles}`,
          };
        }),
      ),
    );
  }

  get termTags() {
    return this.termTagsData.isResolved ? this.termTagsData.value : [];
  }

  @cached
  get courseTagsData() {
    return new TrackedAsyncData(
      Promise.all(
        this.args.selectedCourseIds.map(async (id) => {
          const course = await this.fetchModel('course', id);
          return {
            id,
            class: 'tag-course',
            remove: this.args.removeCourseId,
            name: `${course.year} ${course.title}`,
          };
        }),
      ),
    );
  }

  get courseTags() {
    return this.courseTagsData.isResolved ? this.courseTagsData.value : [];
  }
  <template>
    {{#if this.activeFilters.length}}
      <section class="filters-list" data-test-dashboard-filter-tags>
        {{#if this.filterTags}}
          <header class="filters-header">
            {{t "general.activeFilters"}}:
          </header>
          <div class="filter-tags">
            {{#each (sortBy "name" this.filterTags) as |tag|}}
              <button
                class="filter-tag {{tag.class}}"
                type="button"
                {{on "click" (fn tag.remove tag.id)}}
                data-test-filter-tag
              >
                {{tag.name}}
                <FaIcon @icon="xmark" />
              </button>
            {{/each}}
            <button
              id="calendar-clear-filters"
              class="filters-clear-filters"
              type="button"
              {{on "click" @clearFilters}}
              data-test-clear-filters
            >
              {{t "general.clearFilters"}}
            </button>
          </div>
        {{/if}}
      </section>
    {{/if}}
  </template>
}
