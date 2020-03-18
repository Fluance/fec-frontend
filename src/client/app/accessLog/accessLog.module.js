import angular from 'angular';
import { dataServiceAccessLogs, run as runDataServiceAccessLogs } from './data/accessLogs.dataservice';
import runRoute from './accessLog.route';
import AccessLogController from "./accessLog.controller";
import AccessLog from "./components/accessLog.component";
import AccessLogDetails from "./components/accessLogDetails.component";
import { AccessLogDetailsItem, ProcessLinksFilter } from "./components/accessLogDetailsItem.component";
import AccessLogLink from "./components/accessLogLink.component";
import PatientNavigationButtonAccessLog from "./components/fecPatientNavigationButtonAccessLog.component";
import NavButtonAccessLog from "./components/navButtonAccessLog.component";

angular
    .module('app.accessLog', ['ngSanitize'])
    .run(runRoute)
    .run(runDataServiceAccessLogs)
    .factory('dataservice.accessLogs', dataServiceAccessLogs)
    .controller('AccessLogController', AccessLogController)
    .component('fecAccessLog', AccessLog)
    .component('fecAccessLogDetails', AccessLogDetails)
    .component('fecAccessLogDetailsItem', AccessLogDetailsItem)
    .filter('processLinks', ProcessLinksFilter)
    .component('fecAccessLogLink', AccessLogLink)
    .component('fecPatientNavigationButtonAccessLog', PatientNavigationButtonAccessLog)
    .component('fecNavButtonAccessLog', NavButtonAccessLog)

