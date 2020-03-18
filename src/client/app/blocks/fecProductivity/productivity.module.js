import angular from 'angular';
import productivityService from './productivity.service';
import dataServiceProductivity from './data/productivity.dataservice';
import fecProductivityVcard from './components/fecProductivityVcard.component';
import fecProductivityWidget from './components/fecProductivityWidget.component';
import fecProductivityIcal from './containers/fecProductivityIcalendar.component';
import fecProductivityPatientVcard from './containers/fecProductivityPatientVcard.component';
import fecProductivityPhysicianVcard from './containers/fecProductivityPhysicianVcard.component';

angular
    .module('blocks.fecProductivity', [])
    .factory('productivityService', productivityService)
    .factory('dataservice.productivity', dataServiceProductivity)
    .component('fecProductivityVcard', fecProductivityVcard)
    .component('fecProductivityWidget', fecProductivityWidget)
    .component('fecProductivityIcal', fecProductivityIcal)
    .component('fecProductivityPatientVcard', fecProductivityPatientVcard)
    .component('fecProductivityPhysicianVcard', fecProductivityPhysicianVcard);
