import angular from 'angular';
import datePicker from './datePicker';

angular
    .module('blocks.datePicker', [])
    .factory('datePicker', datePicker);
