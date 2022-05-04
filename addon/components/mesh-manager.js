import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';

const DEBOUNCE_TIMEOUT = 250;
const MIN_INPUT = 3;
const SEARCH_RESULTS_PER_PAGE = 50;

export default class MeshManagerComponent extends Component {
  @service store;
  @service intl;
  @tracked query = '';
  @tracked searchResults = [];
  @tracked searchPage = 0;
  @tracked hasMoreSearchResults = false;
  @tracked searchInput;

  get terms() {
    return this.args.terms ?? [];
  }

  get hasSearchQuery() {
    return this.query.trim() !== '';
  }

  get sortedTerms() {
    if (!this.terms || this.terms.length === 0) {
      return [];
    }
    return this.args.terms.sortBy('name');
  }

  @action
  clear() {
    this.searchResults = [];
    this.searchPage = 0;
    this.hasMoreSearchResults = false;
    this.query = '';
  }

  @action
  add(term) {
    if (!this.args.editable) {
      return;
    }

    if (this.terms.mapBy('id').includes(term.id)) {
      return;
    }
    this.args.add(term);
  }

  @action
  keyUp({ key }) {
    if ('Escape' === key) {
      this.clear();
    }
  }

  @action
  update(event) {
    this.query = event.target.value;
    this.search.perform();
  }

  @action
  moveFocus() {
    // place focus into the search box when search icon is clicked
    this?.searchInput.focus();
  }

  @restartableTask
  *search() {
    if (this.query.length < MIN_INPUT) {
      this.searchResults = [];
      return; // don't linger around return right away
    }
    yield timeout(DEBOUNCE_TIMEOUT);
    const descriptors = (yield this.store.query('mesh-descriptor', {
      q: this.query,
      limit: SEARCH_RESULTS_PER_PAGE + 1,
    })).toArray();

    this.searchPage = 1;
    this.hasMoreSearchResults = descriptors.length > SEARCH_RESULTS_PER_PAGE;
    if (this.hasMoreSearchResults) {
      descriptors.pop();
    }
    this.searchResults = descriptors;
  }

  @dropTask
  *searchMore() {
    const descriptors = (yield this.store.query('mesh-descriptor', {
      q: this.query,
      limit: SEARCH_RESULTS_PER_PAGE + 1,
      offset: this.searchPage * SEARCH_RESULTS_PER_PAGE,
    })).toArray();
    this.searchPage = this.searchPage + 1;
    this.hasMoreSearchResults = descriptors.length > SEARCH_RESULTS_PER_PAGE;
    if (this.hasMoreSearchResults) {
      descriptors.pop();
    }
    this.searchResults = [...this.searchResults, ...descriptors];
  }
}
