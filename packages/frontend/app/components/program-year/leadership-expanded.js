import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ProgramYearLeadershipExpandedComponent extends Component {
  @tracked directors = [];

  get count() {
    return this.directors.length;
  }

  @action
  addDirector(user) {
    this.directors = [...this.directors, user];
  }

  @action
  removeDirector(user) {
    this.directors = this.directors.filter((obj) => obj !== user);
  }

  @action
  manage() {
    this.args.setIsManaging(true);
  }

  async setBuffers() {
    this.directors = (await this.args.programYear.directors).slice();
  }

  load = dropTask(async () => {
    await this.setBuffers();
  });

  save = dropTask(async () => {
    await timeout(10);
    this.args.programYear.set('directors', this.directors);
    this.args.expand();
    await this.args.programYear.save();
    this.args.setIsManaging(false);
  });

  cancel = dropTask(async () => {
    await this.setBuffers();
    this.args.setIsManaging(false);
  });
}
