import angular from 'angular';
import { dataServiceReporting, run as runDataService } from './reporting.dataservice';
import reportingService from "./reporting.service";
import PatientNavigationButtonReporting from "./components/fecPatientNavigationButtonReporting.component";
import NavButtonReporting from "./components/navButtonReporting.component";

angular
    .module('reporting', [])
    .run(runDataService)
    .factory('dataservice.reporting', dataServiceReporting)
    .service('reportingService', reportingService)
    .component('fecPatientNavigationButtonReporting', PatientNavigationButtonReporting)
    .component('fecNavButtonReporting', NavButtonReporting)


