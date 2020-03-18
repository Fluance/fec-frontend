import angular from 'angular';
import { dataServiceMedLab, run as runDataServiceMedLab } from './medlab.dataservice';
import MedLabService from "./medlab.service";
import NavButtonMedLab from "./components/navButtonMedLab.component";
import SelectVisitDialogService from "./components/selectVisitDialog.service";

angular
    .module('medlab',[])
    .run(runDataServiceMedLab)
    .factory('dataservice.medlab', dataServiceMedLab)
    .factory('medlabService', MedLabService)
    .component('fecNavButtonMedLab', NavButtonMedLab)
    .factory('SelectVisitDialogService', SelectVisitDialogService)



