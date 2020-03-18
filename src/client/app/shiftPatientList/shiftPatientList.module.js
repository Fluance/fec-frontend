import angular from 'angular';
import { dataServiceShiftPatients, run as runDataServiceShiftPatients } from './data/shiftPatients.dataservice';
import ShiftPatientListService from "./shiftPatientList.service";
import ShiftPatientList from "./components/ShiftPatientList.component";
import ShiftPatientListButton from "./components/ShiftPatientListButton.component";
import ShiftPatientListPrintButton from "./components/ShiftPatientListPrintButton.component";

angular
    .module('app.shiftPatientList', [])
    .run(runDataServiceShiftPatients)
    .factory('dataservice.shiftPatients', dataServiceShiftPatients)
    .factory('ShiftPatientListService', ShiftPatientListService)
    .component('fecShiftPatientList', ShiftPatientList)
    .component('fecShiftPatientListButton', ShiftPatientListButton)
    .component('fecShiftPatientListPrintButton', ShiftPatientListPrintButton)



