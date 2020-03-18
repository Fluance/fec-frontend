import angular from 'angular';
import mdMenuAddClassDirective from './mdMenuAddClass.directive';

angular
    .module('blocks.mdMenu', [])
    .directive('mdMenuAddClass', mdMenuAddClassDirective);
