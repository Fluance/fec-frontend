import angular from 'angular';
import PatientViewService from './patientView.service';
import fecPatientViewNavigation from './patientViewNavigation.directive';

angular
    .module('blocks.patientView', [])
    .factory('PatientViewService', PatientViewService)
    .directive('fecPatientViewNavigation', fecPatientViewNavigation);


