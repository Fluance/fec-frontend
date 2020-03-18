import angular from 'angular';
import validateData from './dataValidator';

angular
    .module('blocks.dataValidator', [])
    .filter('validateData', validateData);
