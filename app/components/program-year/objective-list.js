import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { hash, map } from 'rsvp';
import { inject as service } from '@ember/service';

export default class ProgramYearObjectiveListComponent extends Component {
  @service iliosConfig;
  @service session;

  @tracked programYearObjectives;
  @tracked isSorting = false;
  @tracked programYearDomains;
  @tracked programYearCompetencies;
  @tracked course;
  @tracked programYearObjectiveCount;

  @restartableTask
  *load(element, [programYear]) {
    if (!programYear) {
      return;
    }
    this.programYearObjectiveCount = programYear.hasMany('programYearObjectives').ids().length;
    const { programYearObjectives, programYearCompetencies } = yield hash({
      programYearObjectives: programYear.sortedProgramYearObjectives,
      programYearCompetencies: programYear.competencies,
    });
    this.programYearObjectives = programYearObjectives;
    this.programYearCompetencies = programYearCompetencies.toArray();
    this.programYearDomains = yield this.getProgramYearDomains(this.programYearCompetencies);
  }

  async getProgramYearDomains(programYearCompetencies) {
    const domains = programYearCompetencies.filterBy('isDomain').toArray();
    return await map(domains, async (domain) => {
      const competencies = (await domain.children).map((competency) => {
        return {
          id: competency.id,
          title: competency.title,
        };
      });
      return {
        id: domain.id,
        title: domain.title,
        competencies,
      };
    });
  }

  get authHeaders() {
    const { jwt } = this.session?.data?.authenticated;
    const headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return new Headers(headers);
  }

  @dropTask
  *downloadReport() {
    const apiPath = '/' + this.iliosConfig.apiNameSpace;
    const resourcePath = `/programyears/${this.args.programYear.id}/downloadobjectivesmapping`;
    const host = this.iliosConfig.apiHost ?? `${window.location.protocol}//${window.location.host}`;
    const url = host + apiPath + resourcePath;
    const { saveAs } = yield import('file-saver');

    const response = yield fetch(url, {
      headers: this.authHeaders,
    });
    const blob = yield response.blob();
    saveAs(blob, 'report.csv');
  }
}
