import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:directorresult', 'DirectorresultController', {
  // Specify the other units that are required for this test.
  needs: ['controller:programyeardirectors', 'controller:programyear']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
