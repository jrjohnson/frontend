import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/global-search-box';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | global search box', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.get('api/search/v1/curriculum', () => {
      return {
        results: {
          autocomplete: ['first', 'second', 'third'],
        },
      };
    });
  });

  test('it renders', async function (assert) {
    assert.expect(1);

    await render(hbs`<GlobalSearchBox />`);
    assert.dom('input[type=search]').exists({ count: 1 });
  });

  test('clicking search icon focuses input', async function (assert) {
    assert.expect(1);

    await render(hbs`<GlobalSearchBox />`);
    await component.clickIcon();
    assert.ok(component.inputHasFocus);
  });

  test('clicking search searches if there is content', async function (assert) {
    assert.expect(1);

    this.set('search', (value) => assert.equal(value, 'typed it'));
    await render(hbs`<GlobalSearchBox @search={{action this.search}} />`);
    await component.input('typed it');
    await component.clickIcon();
  });

  test('displays initial passed down value', async function (assert) {
    assert.expect(1);

    await render(hbs`<GlobalSearchBox @query="course" />`);
    assert.equal(component.inputValue, 'course');
  });

  test('typing start autocomplete', async function (assert) {
    assert.expect(5);

    const input = 'typed it';

    this.server.get('api/search/v1/curriculum', (schema, { queryParams }) => {
      assert.ok(queryParams.q);
      assert.ok(queryParams.onlySuggest);
      assert.equal(queryParams.q, input);
      assert.equal(queryParams.onlySuggest, 'true');

      return {
        results: {
          autocomplete: ['one', 'two', 'three'],
        },
      };
    });

    this.set('search', (value) => {
      assert.equal(value, input);
    });
    await render(hbs`<GlobalSearchBox @search={{action this.search}} />`);
    await component.input(input);
    await component.triggerInput();
    assert.equal(component.autocompleteResults.length, 3);
  });

  test('clicking enter triggers search', async function (assert) {
    assert.expect(3);

    this.set('search', (value) => {
      assert.equal(value, 'typed it');
      assert.ok(true, 'search action gets called');
    });
    await render(hbs`<GlobalSearchBox @search={{action this.search}} />`);
    await component.input('typed it');
    await component.keyUp.enter();
    assert.equal(component.autocompleteResults.length, 0);
  });

  test('escape calls clears query', async function (assert) {
    assert.expect(3);

    await render(hbs`<GlobalSearchBox />`);
    await component.input('typed it');
    assert.equal(component.autocompleteResults.length, 3);
    await component.keyUp.escape();
    assert.equal(component.autocompleteResults.length, 0);
    assert.equal(component.inputValue, '');
  });

  test('vertical triggers work', async function (assert) {
    assert.expect(38);

    let inputValue = 'first';
    this.set('search', (value) => {
      assert.equal(value, inputValue);
      assert.ok(true, 'search action gets called');
    });
    await render(hbs`<GlobalSearchBox @search={{action this.search}} />`);
    await component.input('typed it');
    await component.keyUp.down();
    assert.ok(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.equal(component.inputValue, 'first');
    await component.keyUp.down();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.ok(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.equal(component.inputValue, 'second');
    await component.keyUp.down();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.ok(component.resultsRow3HasActiveClass);
    assert.equal(component.inputValue, 'third');
    await component.keyUp.down();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.equal(component.inputValue, 'typed it');
    await component.keyUp.up();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.ok(component.resultsRow3HasActiveClass);
    assert.equal(component.inputValue, 'third');
    await component.keyUp.up();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.ok(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.equal(component.inputValue, 'second');
    await component.keyUp.up();
    assert.ok(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.equal(component.inputValue, 'first');
    await component.keyUp.up();
    assert.notOk(component.resultsRow1HasActiveClass);
    assert.notOk(component.resultsRow2HasActiveClass);
    assert.notOk(component.resultsRow3HasActiveClass);
    assert.equal(component.inputValue, 'typed it');
    await component.keyUp.down();
    await component.keyUp.enter();
    inputValue = 'second';
    await component.input('typed it');
    await component.keyUp.down();
    await component.keyUp.down();
    await component.keyUp.enter();
    inputValue = 'third';
    await component.input('typed it');
    await component.keyUp.up();
    await component.keyUp.enter();
  });

  test('can empty with backspace', async function (assert) {
    assert.expect(3);
    this.set('query', 'test value');
    await render(hbs`<GlobalSearchBox @query={{this.query}} />`);
    assert.equal(component.inputValue, 'test value');
    await component.input('typed it');
    assert.equal(component.inputValue, 'typed it');
    await component.input('');
    assert.equal(component.inputValue, '');
  });

  test('can empty with backspace after choosing autocomplete', async function (assert) {
    assert.expect(4);
    this.set('query', 'test value');
    await render(hbs`<GlobalSearchBox @query={{this.query}} />`);
    assert.equal(component.inputValue, 'test value');
    await component.input('typed it');
    assert.equal(component.inputValue, 'typed it');
    await component.keyUp.down();
    assert.equal(component.inputValue, 'first');
    await component.input('');
    assert.equal(component.inputValue, '');
  });

  test('require at least three chars to run autocomplete #4769', async function (assert) {
    assert.expect(2);

    const input = 'ty';

    this.set('search', () => {
      assert.ok(false, 'search should not be called');
    });
    await render(hbs`<GlobalSearchBox @search={{action this.search}} />`);
    await component.input(input);
    await component.triggerInput();
    assert.equal(component.autocompleteResults.length, 1);
    assert.equal(component.autocompleteResults[0].text, 'keep typing...');
  });
});
