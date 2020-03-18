import angular from 'angular';
import stringReplace from './stringReplace';

angular
    .module('blocks.stringReplace', [])
    .filter('stringReplace', stringReplace);
