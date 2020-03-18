import angular from 'angular';
import formatMoment from './momentFormatter';

angular
    .module('blocks.momentFormatter', [])
    .filter('formatMoment', formatMoment);

