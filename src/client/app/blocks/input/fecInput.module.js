import angular from 'angular';
import fecInputDirective from './fecInput.directive';

angular
    .module('blocks.fecInput', [])
    .directive('fecInput', fecInputDirective);

