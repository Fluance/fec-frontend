import angular from 'angular';
import runRoute from './imaging.route';
import { dataServiceImaging, run as runDataServiceImaging } from './data/imaging.dataservice';
import imagingReportEmailingService from "./data/imagingReportEmailing.service";
import ImagingController from "./imaging.controller";
import PatientNavigationButtonImaging from "./components/fecPatientNavigationButtonImaging.component";
import ImagingOrder from "./components/imagingOrder.component";
import ImagingOrderReport from "./components/imagingOrderReport.component";
import NavButtonImagingList from "./components/navButtonImagingList.component";

angular
    .module('app.imaging', [])
    .run(runRoute)
    .run(runDataServiceImaging)
    .factory('dataservice.imaging', dataServiceImaging)
    .factory('imagingReportEmailingService', imagingReportEmailingService)
    .controller('ImagingController', ImagingController)
    .component('fecPatientNavigationButtonImaging', PatientNavigationButtonImaging)
    .component('fecImagingOrder', ImagingOrder)
    .component('fecImagingOrderReport', ImagingOrderReport)
    .component('fecNavButtonImagingList', NavButtonImagingList)



