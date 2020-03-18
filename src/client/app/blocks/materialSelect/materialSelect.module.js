import angular from 'angular';
import materialSelect from './materialSelect.directive';

angular
    .module('blocks.materialSelect', [])
    .directive('materialSelect', materialSelect);
