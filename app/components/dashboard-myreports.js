import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { timeout } from 'ember-concurrency';
import PapaParse from 'papaparse';
import createDownloadFile from '../utils/create-download-file';
import { later } from '@ember/runloop';
import { restartableTask, dropTask } from 'ember-concurrency-decorators';
import buildReportTitle from 'ilios/utils/build-report-title';
import { map } from 'rsvp';

const SCROLL_KEY = 'dashboard-my-reports';

export default class DashboardMyreportsComponent extends Component {
  @service currentUser;
  @service preserveScroll;
  @service reporting;
  @service store;
  @service intl;

  @tracked finishedBuildingReport = false;
  @tracked myReportEditorOn = false;

  @tracked user;
  @tracked reports;
  @tracked allAcademicYears;
  @tracked selectedReportTitle;
  @tracked reportResultsList;

  constructor() {
    super(...arguments);
    this.currentUser.getModel().then((user) => (this.user = user));
  }

  @restartableTask
  *load(element, [reports, selectedReport, selectedYear]) {
    if (!reports) {
      return;
    }
    this.reports = yield this.reportsWithTitles(reports.toArray());

    this.allAcademicYears = yield this.store.findAll('academic-year');
    this.selectedReportTitle = null;
    this.reportResultsList = null;

    if (selectedReport) {
      this.selectedReportTitle = yield buildReportTitle(selectedReport, this.store, this.intl);
      this.reportResultsList = yield this.reporting.getResults(selectedReport, selectedYear);
    }
  }

  async reportsWithTitles(reports) {
    return map(reports, async (report) => {
      return {
        title: await buildReportTitle(report, this.store, this.intl),
        report,
      };
    });
  }

  get showAcademicYearFilter() {
    if (!this.args.selectedReport) {
      return false;
    }
    const { subject, prepositionalObject } = this.args.selectedReport;
    return prepositionalObject != 'course' && ['course', 'session'].includes(subject);
  }

  deleteReport(report) {
    report.deleteRecord();
    report.save();
  }

  @action
  setScroll({ target }) {
    this.preserveScroll.savePosition(SCROLL_KEY, target.scrollTop);
  }

  @action
  scrollDown() {
    const position = this.preserveScroll.getPosition(SCROLL_KEY);
    later(() => {
      if (position && this.scrollTarget) {
        this.scrollTarget.scrollTop = position;
      }
    });
  }

  @action
  clearReport() {
    this.preserveScroll.clearPosition(SCROLL_KEY);
    this.args.onReportSelect(null);
  }

  @dropTask
  *downloadReport() {
    const report = this.args.selectedReport;
    const title = this.selectedReportTitle;
    const year = this.args.selectedYear;
    const data = yield this.reporting.getArrayResults(report, year);
    this.finishedBuildingReport = true;
    const csv = PapaParse.unparse(data);
    createDownloadFile(`${title}.csv`, csv, 'text/csv');
    yield timeout(2000);
    this.finishedBuildingReport = false;
  }
}
