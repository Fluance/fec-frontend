import angular from 'angular';
import { dataServicePatients, run as runDataServicePatients } from './data/patients.dataservice';
import patientService from "./patient.service";
import patientIdSelectionDialogService from "./patientIdSelectionDialog.service";
import runRoute from "./patient.route";
import PatientController from "./patient.controller";
import PatientAddress from "./components/fecPatientAddress.component";
import PatientBilling from "./components/fecPatientBilling.component";
import PatientContact from "./components/fecPatientContact.component";
import PatientNavigationButtonPatient from "./components/fecPatientNavigationButtonPatient.component";
import PatientNok from "./components/fecPatientNok.component";
import PatientVisitAdmission from "./components/fecPatientVisitAdmission.component";
import PatientVisitLocation from "./components/fecPatientVisitLocation.component";
import fluancePatient from "./components/fluancePatient.component";
import fluancePatientListItem from "./components/fluancePatientListItem.component";

angular
    .module('app.patient', [])
    .run(runRoute)
    .run(runDataServicePatients)
    .factory('dataservice.patients', dataServicePatients)
    .factory('patientService', patientService)
    .service('patientIdSelectionDialogService', patientIdSelectionDialogService)
    .controller('PatientController', PatientController)
    .component('fecPatientAddress', PatientAddress)
    .component('fecPatientBilling', PatientBilling)
    .component('fecPatientContact', PatientContact)
    .component('fecPatientNavigationButtonPatient', PatientNavigationButtonPatient)
    .component('fecPatientNok', PatientNok)
    .component('fecPatientVisitAdmission', PatientVisitAdmission)
    .component('fecPatientVisitLocation', PatientVisitLocation)
    .component('fluancePatient', fluancePatient)
    .component('fluancePatientListItem', fluancePatientListItem);


