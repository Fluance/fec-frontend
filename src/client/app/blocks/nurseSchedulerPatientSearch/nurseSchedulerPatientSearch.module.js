import angular from 'angular';
import nurseSchedulerPatientSearch from './nurseSchedulerPatientSearch';

angular
    .module('blocks.nurseSchedulerPatientSearch', [])
    .filter('nurseSchedulerPatientSearch', nurseSchedulerPatientSearch);



