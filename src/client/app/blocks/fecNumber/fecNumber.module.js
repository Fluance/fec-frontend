import angular from 'angular';
import fecNumber from './fecNumber';

angular
    .module('blocks.fecNumber', [])
    .filter('fecNumber', fecNumber);


