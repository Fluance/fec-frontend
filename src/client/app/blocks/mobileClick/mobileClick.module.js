import angular from 'angular';
import MobileClick from './mobileClick.directive';

angular
    .module('blocks.mobileClick', [])
    .directive('fecMobileClick', MobileClick);

