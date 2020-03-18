import angular from 'angular';
import { DocumentsDataService, run as runDocumentsDataService } from './data/document.dataservice';
import runRoute from './document.route';
import DocumentController from "./document.controller";
import DocumentService from "./document.service";
import PatientNavigationButtonDocument from "./components/fecPatientNavigationButtonDocument.component";
import NavButtonDocument from "./components/navButtonDocument.component";
import PatientDocumentItem from "./components/patientDocumentItem.component";
import PatientDocumentList from "./components/patientDocumentList.component";

angular
    .module('app.document', [])
    .run(runRoute)
    .run(runDocumentsDataService)
    .factory('dataservice.documents', DocumentsDataService)
    .controller('DocumentController', DocumentController)
    .factory('DocumentService', DocumentService)
    .component('fecPatientNavigationButtonDocument', PatientNavigationButtonDocument)
    .component('fecNavButtonDocument', NavButtonDocument)
    .component('fecPatientDocumentItem', PatientDocumentItem)
    .component('fecPatientDocumentList', PatientDocumentList)


