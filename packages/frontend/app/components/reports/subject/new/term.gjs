import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { hash } from 'rsvp';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';
import eq from 'ember-truth-helpers/helpers/eq';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class ReportsSubjectNewProgramYearComponent extends Component {
  @service store;

  @cached
  get allTermsData() {
    return new TrackedAsyncData(
      hash({
        terms: this.store.findAll('term'),
        vocabularies: this.store.findAll('vocabulary'),
      }),
    );
  }

  get allTerms() {
    return this.allTermsData.isResolved ? this.allTermsData.value : [];
  }

  get mappedTerms() {
    return this.allTerms.terms.map((term) => {
      const vocabularyId = term.belongsTo('vocabulary').id();
      const vocabulary = this.allTerms.vocabularies.find(({ id }) => id === vocabularyId);
      const schoolId = vocabulary.belongsTo('school').id();
      const title = [...this.getParentTitlesForTerm(term), term.title].join(' > ');
      return {
        title,
        term,
        vocabulary,
        schoolId,
      };
    });
  }

  getParentTitlesForTerm(term) {
    const pId = term.belongsTo('parent').id();
    if (!pId) {
      return [];
    }
    const parent = this.allTerms.terms.find((t) => t.id === pId);

    return [...this.getParentTitlesForTerm(parent), parent.title];
  }

  get filteredTerms() {
    if (this.args.school) {
      return this.mappedTerms.filter(({ schoolId }) => schoolId === this.args.school.id);
    }

    return this.mappedTerms;
  }

  get sortedTerms() {
    return sortBy(this.filteredTerms, ['vocabulary.title', 'title']);
  }

  get bestSelectedTerm() {
    const ids = this.sortedTerms.map(({ term }) => term.id);
    if (ids.includes(this.args.currentId)) {
      return this.args.currentId;
    }

    return null;
  }

  @action
  updatePrepositionalObjectId(event) {
    const value = event.target.value;
    this.args.changeId(value);

    if (!isNaN(value)) {
      event.target.classList.remove('error');
    }
  }
  <template>
    <p data-test-reports-subject-new-term>
      <label for="new-term">
        {{t "general.whichIs"}}
      </label>
      {{#if this.allTermsData.isResolved}}
        <select
          id="new-term"
          data-test-prepositional-objects
          {{on "change" this.updatePrepositionalObjectId}}
        >
          <option selected={{isEmpty @currentId}} value>
            {{t "general.selectPolite"}}
          </option>
          {{#each this.sortedTerms as |obj|}}
            <option selected={{eq obj.term.id this.bestSelectedTerm}} value={{obj.term.id}}>
              {{obj.vocabulary.title}}
              >
              {{obj.title}}
              {{#unless obj.term.active}}
                ({{t "general.inactive"}})
              {{/unless}}
            </option>
          {{/each}}
        </select>
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </p>
  </template>
}
