import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/global-search';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | global-search', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(1);

    await render(hbs`<GlobalSearch />`);
    assert.dom('[data-test-global-search-box]').exists({ count: 1 });
  });

  test('handles empty and non-empty query', async function (assert) {
    assert.expect(4);
    this.server.get('api/search/v1/curriculum', (schema, { queryParams: { q, onlySuggest } }) => {
      assert.equal(q, 'hello world');
      assert.notOk(onlySuggest);
      return {
        results: {
          autocomplete: [],
          courses: [],
        },
      };
    });

    this.set('query', '');
    await render(hbs`<GlobalSearch @query={{this.query}} />`);
    assert.ok(component.noResultsIsVisible);
    this.set('query', 'hello world');
    assert.notOk(component.noResultsIsVisible);
  });

  test('bubbles action properly', async function (assert) {
    assert.expect(3);
    this.server.get('api/search/v1/curriculum', (schema, { queryParams: { q, onlySuggest } }) => {
      assert.equal(q, 'typed it');
      assert.ok(onlySuggest);
      return {
        results: {
          autocomplete: [],
          courses: [],
        },
      };
    });

    this.set('query', (value) => assert.equal(value, 'typed it'));
    await render(hbs`<GlobalSearch @onQuery={{action this.query}} />`);
    await component.input('typed it');
    await component.clickIcon();
  });

  test('academic year filter works properly', async function (assert) {
    assert.expect(16);

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
          courses: [
            {
              title: 'Course 1',
              year: 2019,
              sessions: [],
            },
            {
              title: 'Course 2',
              year: 2020,
              sessions: [],
            },
            {
              title: 'Course 3',
              year: 2021,
              sessions: [],
            },
            {
              title: 'Course 4',
              year: 2021,
              sessions: [],
            },
          ],
        },
      };
    });

    this.set('query', 'hello world');
    this.set('selectedYear', null);
    await render(hbs`<GlobalSearch
      @page="1"
      @query={{this.query}}
      @selectedYear={{this.selectedYear}}
      @setSelectedYear={{action (mut this.selectedYear)}}
    />`);
    assert.equal(component.academicYear, '');
    assert.equal(
      component.academicYearOptions,
      'All Academic Years 2021 - 2022 2020 - 2021 2019 - 2020'
    );
    assert.equal(component.searchResults.length, 4);
    assert.equal(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.equal(component.searchResults[1].courseTitle, '2020 Course 2');
    assert.equal(component.searchResults[2].courseTitle, '2021 Course 3');
    assert.equal(component.searchResults[3].courseTitle, '2021 Course 4');
    await component.selectAcademicYear('2021');
    assert.equal(component.searchResults.length, 2);
    assert.equal(component.searchResults[0].courseTitle, '2021 Course 3');
    assert.equal(component.searchResults[1].courseTitle, '2021 Course 4');
    await component.selectAcademicYear('2020');
    assert.equal(component.academicYear, '2020');
    assert.equal(component.searchResults.length, 1);
    assert.equal(component.searchResults[0].courseTitle, '2020 Course 2');
    await component.selectAcademicYear('2019');
    assert.equal(component.academicYear, '2019');
    assert.equal(component.searchResults.length, 1);
    assert.equal(component.searchResults[0].courseTitle, '2019 Course 1');
  });

  test('school filter works properly', async function (assert) {
    assert.expect(51);
    this.server.create('school', { title: 'Medicine' });
    this.server.create('school', { title: 'Dentistry' });
    this.server.create('school', { title: 'Pharmacy' });

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
          courses: [
            {
              title: 'Course 1',
              year: 2019,
              school: 'Medicine',
              sessions: [],
            },
            {
              title: 'Course 2',
              year: 2020,
              school: 'Medicine',
              sessions: [],
            },
            {
              title: 'Course 3',
              year: 2021,
              school: 'Pharmacy',
              sessions: [],
            },
            {
              title: 'Course 4',
              year: 2021,
              school: 'Dentistry',
              sessions: [],
            },
          ],
        },
      };
    });

    this.set('query', 'hello world');
    this.set('ignoredSchoolIds', []);
    await render(hbs`<GlobalSearch
      @page="1"
      @query={{this.query}}
      @ignoredSchoolIds={{this.ignoredSchoolIds}}
      @setIgnoredSchoolIds={{action (mut this.ignoredSchoolIds)}}
    />`);
    assert.equal(component.searchResults.length, 4);
    assert.equal(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.equal(component.searchResults[1].courseTitle, '2020 Course 2');
    assert.equal(component.searchResults[2].courseTitle, '2021 Course 3');
    assert.equal(component.searchResults[3].courseTitle, '2021 Course 4');
    assert.equal(component.schoolFilters.length, 3);
    assert.equal(component.schoolFilters[0].school, 'Dentistry (1)');
    assert.ok(component.schoolFilters[0].isSelected);
    assert.equal(component.schoolFilters[1].school, 'Medicine (2)');
    assert.ok(component.schoolFilters[1].isSelected);
    assert.equal(component.schoolFilters[2].school, 'Pharmacy (1)');
    assert.ok(component.schoolFilters[2].isSelected);

    await component.schoolFilters[1].toggle();

    assert.equal(component.searchResults.length, 2);
    assert.equal(component.searchResults[0].courseTitle, '2021 Course 3');
    assert.equal(component.searchResults[1].courseTitle, '2021 Course 4');
    assert.equal(component.schoolFilters.length, 3);
    assert.equal(component.schoolFilters[0].school, 'Dentistry (1)');
    assert.ok(component.schoolFilters[0].isSelected);
    assert.equal(component.schoolFilters[1].school, 'Medicine (2)');
    assert.notOk(component.schoolFilters[1].isSelected);
    assert.equal(component.schoolFilters[2].school, 'Pharmacy (1)');
    assert.ok(component.schoolFilters[2].isSelected);

    await component.schoolFilters[0].toggle();

    assert.equal(component.searchResults.length, 1);
    assert.equal(component.searchResults[0].courseTitle, '2021 Course 3');
    assert.equal(component.schoolFilters.length, 3);
    assert.equal(component.schoolFilters[0].school, 'Dentistry (1)');
    assert.notOk(component.schoolFilters[0].isSelected);
    assert.equal(component.schoolFilters[1].school, 'Medicine (2)');
    assert.notOk(component.schoolFilters[1].isSelected);
    assert.equal(component.schoolFilters[2].school, 'Pharmacy (1)');
    assert.ok(component.schoolFilters[2].isSelected);

    await component.schoolFilters[2].toggle();

    assert.equal(component.searchResults.length, 0);
    assert.equal(component.schoolFilters.length, 3);
    assert.equal(component.schoolFilters[0].school, 'Dentistry (1)');
    assert.notOk(component.schoolFilters[0].isSelected);
    assert.equal(component.schoolFilters[1].school, 'Medicine (2)');
    assert.notOk(component.schoolFilters[1].isSelected);
    assert.equal(component.schoolFilters[2].school, 'Pharmacy (1)');
    assert.notOk(component.schoolFilters[2].isSelected);

    await component.schoolFilters[0].toggle();
    await component.schoolFilters[1].toggle();
    await component.schoolFilters[2].toggle();

    assert.equal(component.searchResults.length, 4);
    assert.equal(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.equal(component.searchResults[1].courseTitle, '2020 Course 2');
    assert.equal(component.searchResults[2].courseTitle, '2021 Course 3');
    assert.equal(component.searchResults[3].courseTitle, '2021 Course 4');
    assert.equal(component.schoolFilters.length, 3);
    assert.equal(component.schoolFilters[0].school, 'Dentistry (1)');
    assert.ok(component.schoolFilters[0].isSelected);
    assert.equal(component.schoolFilters[1].school, 'Medicine (2)');
    assert.ok(component.schoolFilters[1].isSelected);
    assert.equal(component.schoolFilters[2].school, 'Pharmacy (1)');
    assert.ok(component.schoolFilters[2].isSelected);
  });

  test('all schools show up in filter', async function (assert) {
    assert.expect(9);
    this.server.createList('school', 3);

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
          courses: [
            {
              title: 'Course 1',
              year: 2019,
              school: 'school 1',
              sessions: [],
            },
          ],
        },
      };
    });

    this.set('query', 'hello world');
    await render(hbs`<GlobalSearch @page="1" @query={{this.query}} />`);
    assert.equal(component.searchResults.length, 1);
    assert.equal(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.equal(component.schoolFilters.length, 3);
    assert.equal(component.schoolFilters[0].school, 'school 0 (0)');
    assert.ok(component.schoolFilters[0].isDisabled);
    assert.equal(component.schoolFilters[1].school, 'school 1 (1)');
    assert.notOk(component.schoolFilters[1].isDisabled);
    assert.equal(component.schoolFilters[2].school, 'school 2 (0)');
    assert.ok(component.schoolFilters[2].isDisabled);
  });

  test('if only one school in system no school filter', async function (assert) {
    assert.expect(3);
    this.server.create('school');

    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
          courses: [
            {
              title: 'Course 1',
              year: 2019,
              school: 'school 1',
              sessions: [],
            },
          ],
        },
      };
    });

    this.set('query', 'hello world');
    await render(hbs`<GlobalSearch @page="1" @query={{this.query}} />`);
    assert.equal(component.searchResults.length, 1);
    assert.equal(component.searchResults[0].courseTitle, '2019 Course 1');
    assert.equal(component.schoolFilters.length, 0);
  });
});
