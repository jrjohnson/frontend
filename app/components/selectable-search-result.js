import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  selectedItems: Ember.A(),
  item: null,
  selected: computed('item', 'selectedItems.@each', function(){
    return this.get('selectedItems').contains(this.item);
  }),
  click: function() {
    this.sendAction('action', this.get('item'));
  }
});
