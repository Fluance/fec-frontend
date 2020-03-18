import angular from 'angular';
import runRoute from './visit.route';

import { dataserviceVisits, run as runDataserviceVisits } from './data/visits.dataservice';
import VisitController from "./visit.controller";
import visitIdSelectionDialogService from "./visitIdSelectionDialog.service";
import VisitsController from "./visits.controller";
import MedicalInterventions from "./components/fecMedicalInterventions.component";
import PatientNavigationButtonVisit from "./components/fecPatientNavigationButtonVisit.component";
import VisitDetails from "./components/visit-details.component";
import VisitPhysicianAdmitting from "./components/fecVisitPhysicianAdmitting.component";
import VisitPhysicianAttending from "./components/fecVisitPhysicianAttending.component";
import VisitPhysicianConsulting from "./components/fecVisitPhysicianConsulting.component";
import VisitPhysicianReferring from "./components/fecVisitPhysicianReferring.component";
import NavButtonVisit from "./components/navButtonVisit.component";
import NavButtonVisitList from "./components/navButtonVisitList.component";
import NavButtonVisitDetails from './components/navButtonVisitDetails.component';

angular
    .module('app.visit', [])
    .run(runRoute)
    .run(runDataserviceVisits)
    .factory('dataservice.visits', dataserviceVisits)
    .controller('VisitController', VisitController)
    .service('visitIdSelectionDialogService', visitIdSelectionDialogService)
    .controller('VisitsController', VisitsController)
    .component('fecMedicalInterventions', MedicalInterventions)
    .component('fecPatientNavigationButtonVisit', PatientNavigationButtonVisit)
    .component('fecVisit', VisitDetails)
    .component('fecVisitPhysicianAdmitting', VisitPhysicianAdmitting)
    .component('fecVisitPhysicianAttending', VisitPhysicianAttending)
    .component('fecVisitPhysicianConsulting', VisitPhysicianConsulting)
    .component('fecVisitPhysicianReferring', VisitPhysicianReferring)
    .component('fecNavButtonVisit', NavButtonVisit)
    .component('fecNavButtonVisitList', NavButtonVisitList)
    .component('fecNavButtonVisitDetails', NavButtonVisitDetails)



