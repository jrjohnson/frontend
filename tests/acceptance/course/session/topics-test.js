import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {c as testgroup} from 'ilios/tests/helpers/test-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Topics' + testgroup, {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('sessionType');
    server.create('school', {
      topics: [1,2]
    });
    server.create('course', {
      school: 1
    });

    fixtures.topics = [];
    fixtures.topics.pushObject(server.create('topic', {
      sessions: [1],
      school: 1
    }));
    fixtures.topics.pushObject(server.create('topic', {
      school: 1
    }));

    fixtures.session =
    server.create('session', {
      course: 1,
      topics: [1]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list topics', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-topics');
    var items = find('ul.columnar-list li', container);
    assert.equal(items.length, fixtures.session.topics.length);
    assert.equal(getElementText(items.eq(0)), getText('topic 0'));
  });
});

test('manage topics', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-topics');
    click(find('.detail-actions button', container));
    andThen(function(){
      assert.equal(getElementText(find('.removable-list li', container)), getText('topic 0'));
      assert.equal(getElementText(find('.selectable-list li', container)), getText('topic 1'));
    });
  });
});

test('save topic chages', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    var container = find('.detail-topics');
    click(find('.detail-actions button', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-list li:eq(1)', container)).then(function(){
          click('button.bigadd', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('ul.columnar-list li', container)), getText('topic 1'));
      });
    });
  });
});

test('cancel topic chages', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    var container = find('.detail-topics');
    click(find('.detail-actions button', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-list li:eq(1)', container)).then(function(){
          click('button.bigcancel', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('ul.columnar-list li', container)), getText('topic 0'));
      });
    });
  });
});
