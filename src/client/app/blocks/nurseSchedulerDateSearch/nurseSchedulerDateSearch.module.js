import angular from 'angular';
import nurseSchedulerDateSearch from './nurseSchedulerDateSearch';

angular
    .module('blocks.nurseSchedulerDateSearch', [])
    .filter('nurseSchedulerDateSearch', nurseSchedulerDateSearch);


