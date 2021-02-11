import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/pagedlist-controls';

module('Integration | Component | pagedlist controls', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<PagedlistControls @limit={{10}} @offset={{11}} @total={{33}} />`);
    assert.equal(component.limit.options.length, 3);
    assert.equal(component.limit.options[0].text, '10');
    assert.equal(component.limit.options[1].text, '25');
    assert.equal(component.limit.options[2].text, '50');
    assert.ok(component.limit.options[0].selected);
    assert.equal(component.pagerDetails.text, 'Showing 12 - 21 of 33');
    assert.ok(component.canGoBack);
    assert.ok(component.canGoForward);
  });

  test('limitless', async function (assert) {
    await render(hbs`<PagedlistControls @limitless={{true}} />`);
    assert.equal(component.limit.options.length, 7);
    assert.equal(component.limit.options[0].text, '10');
    assert.equal(component.limit.options[1].text, '25');
    assert.equal(component.limit.options[2].text, '50');
    assert.equal(component.limit.options[3].text, '100');
    assert.equal(component.limit.options[4].text, '200');
    assert.equal(component.limit.options[5].text, '400');
    assert.equal(component.limit.options[6].text, '1000');
    assert.notOk(component.pagerDetails.isPresent);
  });

  test('first page', async function (assert) {
    await render(hbs`<PagedlistControls @offset={{0}} @limit={{10}} @total={{100}} />`);
    assert.notOk(component.canGoBack);
    assert.ok(component.canGoForward);
  });

  test('last page', async function (assert) {
    await render(hbs`<PagedlistControls @offset={{90}} @limit={{10}} @total={{100}} />`);
    assert.ok(component.canGoBack);
    assert.notOk(component.canGoForward);
  });

  test('last page is first page', async function (assert) {
    await render(hbs`<PagedlistControls @offset={{0}} @limit={{10}} @total={{10}} />`);
    assert.notOk(component.canGoBack);
    assert.notOk(component.canGoForward);
  });

  test('go back', async function (assert) {
    assert.expect(1);
    this.set('setOffset', (offset) => {
      assert.equal(offset, 80);
    });
    await render(
      hbs`<PagedlistControls @offset={{90}} @limit={{10}} @total={{100}} @setOffset={{this.setOffset}} />`
    );
    await component.goBack();
  });

  test('go forward', async function (assert) {
    assert.expect(1);
    this.set('setOffset', (offset) => {
      assert.equal(offset, 10);
    });
    await render(
      hbs`<PagedlistControls @offset={{0}} @limit={{10}} @total={{100}} @setOffset={{this.setOffset}} />`
    );
    await component.goForward();
  });

  test('change limit', async function (assert) {
    assert.expect(2);
    this.set('setLimit', (limit) => {
      assert.equal(limit, 10);
    });
    this.set('setOffset', (offset) => {
      assert.equal(offset, 0);
    });
    await render(hbs`<PagedlistControls
      @offset={{10}}
      @limit={{25}}
      @total={{100}}
      @setOffset={{this.setOffset}}
      @setLimit={{this.setLimit}}
    />`);
    await component.limit.set(10);
  });
});
