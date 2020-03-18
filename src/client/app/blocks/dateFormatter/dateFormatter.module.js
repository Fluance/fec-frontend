import angular from 'angular';
import formatDate from './dateFormatter';

angular
    .module('blocks.dateFormatter', [])
    .filter('formatDate', formatDate);


